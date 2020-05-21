<template>
    <div :class="classes" role="tree" onselectstart="return false">
        <ul :class="containerClasses" role="group">
            <tree-item v-for="(child, index) in data"
                       :key="index"
                       :data="child"
                       :text-field-name="textFieldName"
                       :value-field-name="valueFieldName"
                       :children-field-name="childrenFieldName"
                       :item-events="itemEvents"
                       :whole-row="wholeRow"
                       :show-checkbox="showCheckbox"
                       :allow-transition="allowTransition"
                       :height="sizeHeight"
                       :parent-item="data"
                       :draggable="draggable"
                       :drag-over-background-color="dragOverBackgroundColor"
                       :on-item-click="onItemClick"
                       :on-item-toggle="onItemToggle"
                       :on-item-drag-start="onItemDragStart"
                       :on-item-drag-end="onItemDragEnd"
                       :on-item-drop="onItemDrop"
                       :klass="index === data.length-1?'tree-last':''"
                       :expand-timer="expandTimer"
                       :expand-timer-time-out="expandTimerTimeOut"
                       :show-drop-position="showDropPosition"
                       :allowed-to-drop="allowedToDrop"
                       :current-is-draggable="currentIsDraggable"

            >
                <template slot-scope="_">
                    <slot :vm="_.vm" :model="_.model">
                        <i :class="_.vm.themeIconClasses" role="presentation" v-if="!_.model.loading"></i>
                        <span v-html="_.model[textFieldName]"></span>
                    </slot>
                </template>
            </tree-item>
        </ul>
    </div>
</template>
<script>
    import TreeItem from './tree-item.vue' // holds the node vue component
    import TreeNode from './tree-node' // holds the node data model

    let ITEM_HEIGHT_SMALL = 18
    let ITEM_HEIGHT_DEFAULT = 24
    let ITEM_HEIGHT_LARGE = 32

    export default {
        name: 'VJstree',
        props: {
            data: {type: Array},
            size: {type: String, validator: value => ['large', 'small',''].indexOf(value) > -1},
            showCheckbox: {type: Boolean, default: false},
            wholeRow: {type: Boolean, default: false},
            noDots: {type: Boolean, default: false},
            collapse: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            allowBatch: {type: Boolean, default: false},
            allowTransition: {type: Boolean, default: true},
            textFieldName: {type: String, default: 'text'},
            valueFieldName: {type: String, default: 'value'},
            childrenFieldName: {type: String, default: 'children'},
            itemEvents: {
                type: Object, default: function () {
                    return {}
                }
            },
            async: {type: Function},
            loadingText: {type: String, default: 'Loading...'},
            draggable: {type: Boolean, default: false},
            dragOverBackgroundColor: {type: String, default: "#C9FDC9"},
            klass: String,

            expandTimer:{type: Boolean, default: false},
            expandTimerTimeOut:{type: Number, default: 1500},
            executeSiblingMovement:{type: Boolean, default:false},
            showDropPosition:{type: Boolean, default:true},
            multiTree: {type: Boolean, default: false},
            allowMultiTreeAndUsual: {type: Boolean, default: false},
            currentDraggedItem: { type: Object, default: null }
        },
        data() {
            return {
                draggedItem: undefined,
                draggedElm: undefined,
                currentIsDraggable : true,
            }
        },
        computed: {
            classes() {
                return [
                    {'tree': true},
                    {'tree-default': !this.size},
                    {[`tree-default-${this.size}`]: !!this.size},
                    {'tree-checkbox-selection': !!this.showCheckbox},
                    {[this.klass]: !!this.klass}
                ]
            },
            containerClasses() {
                return [
                    {'tree-container-ul': true},
                    {'tree-children': true},
                    {'tree-wholerow-ul': !!this.wholeRow},
                    {'tree-no-dots': !!this.noDots}
                ]
            },
            sizeHeight() {
                switch (this.size) {
                    case 'large':
                        return ITEM_HEIGHT_LARGE;
                    case 'small':
                        return ITEM_HEIGHT_SMALL;
                    default:
                        return ITEM_HEIGHT_DEFAULT;
                }
            }
        },
        methods: {
            /**
             * Initialize nodes takes a json object and sets nodes by reference
             * @param nodes
             */
            initializeNodes(nodes) {
                if (nodes && nodes.length > 0) {
                    for (let i in nodes) {
                        nodes[i] = this.initializeNode(nodes[i]);
                    }
                }
            },
            initializeNode(item) {
                return TreeNode(this,item);
            },
            initializeLoading() {
                var item = {}
                item[this.textFieldName] = this.loadingText
                item.disabled = true
                item.loading = true
                return this.initializeNode(item)
            },
            handleRecursionNodeChilds(node, func) {
                if (func(node) !== false) {
                    if (node.$children && node.$children.length > 0) {
                        for (let childNode of node.$children) {
                            if (!childNode.disabled) {
                                this.handleRecursionNodeChilds(childNode, func)
                            }
                        }
                    }
                }
            },
            handleRecursionNodeChildren(node, func) {
                if (func(node) !== false) {
                    if (node[this.childrenFieldName] && node[this.childrenFieldName].length > 0) {
                        for (let childNode of node[this.childrenFieldName]) {
                            this.handleRecursionNodeChildren(childNode, func)
                        }
                    }
                }
            },
            onItemClick(targetNode, e) {
                if (this.multiple) {
                    if (this.allowBatch) {
                        this.handleBatchSelectItems(targetNode)
                    }
                } else {
                    this.handleSingleSelectItems(targetNode)
                }
                this.$emit('item-click', targetNode, targetNode.model, e)
            },
            handleSingleSelectItems(targetNode) {
                this.handleRecursionNodeChilds(this, node => {
                    if (node.model) node.model.selected = false
                })
                targetNode.model.selected = true
            },
            handleBatchSelectItems(targetNode) {
                this.handleRecursionNodeChilds(targetNode, node => {
                    if (node.model.disabled) return
                    node.model.selected = targetNode.model.selected
                })
            },
            onItemToggle(targetNode, e) {
                if (targetNode.model.opened) {
                    this.handleAsyncLoad(targetNode.model[this.childrenFieldName], targetNode)
                }
                this.$emit('item-toggle', targetNode, targetNode.model, e)
            },
            handleAsyncLoad(targetParent, targetNode) {
                var self = this;
                if (this.async) {
                    this.async(targetNode, (data) => {
                        if (data.length > 0) {
                            for (let i in data) {
                                if (!data[i].isLeaf) {
                                    if (typeof data[i][self.childrenFieldName] !== "object") {
                                        data[i][self.childrenFieldName] = [self.initializeLoading()]
                                    }
                                }
                                var node = self.initializeNode(data[i])
                                self.$set(targetParent, i, node)
                            }
                        } else {
                            targetNode.model[self.childrenFieldName] = []
                        }
                        if(targetNode.model){
                            targetNode.model.loading = false;
                        }
                    })

                }
            },
            onItemDragStart(e, targetNode) {

                if (!this.allowedToDrag(targetNode)) {

                    // The dragged item isn't draggable
                    this.currentIsDraggable = false;

                    // Hide item during drag:
                    e.target.style.opacity = '0';

                    // Since dragstart event freezes style during drag operation we can reset style immediately
                    // without impacting it. As soon as user drops the item it will reset back to original.
                    setTimeout(() => e.target.style.opacity = '1',1);

                    // Set mouse pointer to forbidden pointer during drag:
                    e.dataTransfer.effectAllowed = 'none';

                    return false;
                }

                if(this.multiTree){

                    this.draggedItem = {
                        item: targetNode.model,
                        parentItem: targetNode.parentItem,
                        index: targetNode.parentItem.findIndex(t => t.id === targetNode.model.id),
                    }

                }else{

                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData('text', "")
                    this.draggedElm = e.target
                    this.draggedItem = {
                        item: targetNode.model,
                        parentItem: targetNode.parentItem,
                        index: targetNode.parentItem.findIndex(t => t.id === targetNode.model.id)
                    }

                }
                this.$emit("item-drag-start", targetNode, targetNode.model,this.draggedItem, e)

            },
            onItemDragEnd(e, targetNode) {
                this.draggedItem = undefined
                this.draggedElm = undefined
                this.currentIsDraggable = true;
                this.$emit("item-drag-end", targetNode, targetNode.model, e)
            },
            allowedToDrop (targetNode, position) {

                if (!this.draggable || !this.draggedItem) {
                    return false
                }
                if (position === '2' && targetNode.model.dropDisabled === true) {
                    return false
                }

                if (this.draggedItem.parentItem === targetNode.model.children ||
                    this.draggedItem.item === targetNode.model ||
                    (this.draggedItem.item.children && this.draggedItem.item.children.indexOf(targetNode.model) !== -1)) {
                    return false
                }

                return true
            },
            allowedToDrag(targetNode) {
                return this.draggable && !targetNode.model.dragDisabled;
            },
            onItemDrop(e, targetNode, position) {

                if (!this.draggable)
                    return false

                this.$emit("item-drop-before", targetNode, targetNode.model, !this.draggedItem ? undefined : this.draggedItem.item, e)

                if(this.multiTree && !this.allowMultiTreeAndUsual) {
                    this.draggedItem = this.currentDraggedItem;
                    //this.$emit('item-drop-multi-tree', targetNode, targetNode.model, position, e);
                }

                if (this.draggedItem && targetNode.model[this.childrenFieldName] !== this.draggedItem.item[this.childrenFieldName]) {

                    var newParent = ''
                    if (position === '2') {
                        /** Item is droped on the other item (folder) ****/
                        if (!this.allowedToDrop(targetNode, position)) return

                        if(this.executeSiblingMovement){
                            this.draggedItem.item.moveTo(this.draggedItem, targetNode.model);
                        }

                        this.$emit('item-drop', targetNode, targetNode.model, this.draggedItem, e)

                    }
                    else if (targetNode.parentItem) {
                        /** Item is droped before or under existing item ****/
;
                        if (targetNode.parentId) newParent = targetNode.parentId;

                        // Find position of destination item in the parent group
                        var oriIndex = targetNode.parentItem.findIndex(node => node.id === targetNode.model.id);

                        var anchor_modificator = '';
                        if (position === '1') {
                            //before anchor node
                            if(this.executeSiblingMovement){
                                this.draggedItem.item.moveLeftTo(this.draggedItem, targetNode, oriIndex)
                            }
                            anchor_modificator = "-left";
                        }
                        else if (position === '3') {
                            //after anchor node
                            if(this.executeSiblingMovement) {
                                this.draggedItem.item.moveRightTo(this.draggedItem, targetNode, oriIndex);
                            }
                            anchor_modificator = "-right";

                        }

                        this.$emit('item-drop-sibling'+anchor_modificator, targetNode, targetNode.model, this.draggedItem, oriIndex,e)
                    }
                }
            }
        },
        created() {
            this.initializeNodes(this.data)
        },
        mounted() {
            if (this.async) {
                this.$set(this.data, 0, this.initializeLoading())
                this.handleAsyncLoad(this.data, this)
            }
        },
        components: {
            TreeItem
        }
    }
</script>
<style lang="less">
    @import "./less/style";
</style>