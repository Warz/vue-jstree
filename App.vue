<template>
    <div id="app" style="padding-bottom: 300px;">
        <img src="./assets/logo.png">
        <h1>{{ msg }}</h1>
        <h2>Tree View</h2>
        <div>
            <div style="width:840px; margin: 0 auto;">
                <div style="width:49%; display:inline-block; vertical-align: top;">
                    <p style="text-align:left">Search Text <input type="text" @keyup="inputKeyUp" v-model="searchText" /></p>
                    <br>
                    <v-jstree :data="data"
                              :item-events="itemEvents"
                              show-checkbox
                              multiple
                              allow-batch
                              whole-row
                              draggable
                              expand-timer
                              :expand-timer-time-out="5000"
                              execute-sibling-movement
                              :multi-tree="multiTree"
                              @item-click="itemClick"
                              @item-drag-start="itemDragStart"
                              @item-drag-end="itemDragEnd"
                              @item-drop-before="itemDropBefore"
                              @item-drop="itemDrop"
                              ref="tree"></v-jstree>

                    <br>
                    <span style="float: left; background-color: red; color: #fff; padding: 6px" draggable="true">
            drag me to add new child !
          </span>
                    <input type="checkbox" id="multiTreeFlag"
                           v-model="multiTree"
                           value=true>Enable multiTree<br>

                </div>
                <div style="width:50%; display:inline-block;">
        <textarea  style="height:300px; width:100%;">
          {{data}}
        </textarea>
                </div>
            </div>
        </div>
        <h2>Edit Tree Item</h2>
        <p>click the node for edit</p>
        <div>
            <div style="width:840px; height:300px; margin: 0 auto;">
                <table>
                    <tr>
                        <td>
                            text
                        </td>
                        <td>
                            <input v-model="editingItem.text" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            value
                        </td>
                        <td>
                            <input v-model="editingItem.value" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            icon
                        </td>
                        <td>
                            <input v-model="editingItem.icon" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            opened
                        </td>
                        <td>
                            <input type="checkbox" v-model="editingItem.opened"/>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            selected
                        </td>
                        <td>
                            <input type="checkbox" v-model="editingItem.selected" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            disabled
                        </td>
                        <td>
                            <input type="checkbox" v-model="editingItem.disabled" />
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <button @click="addChildNode">add child node</button>
                            <button @click="removeNode">remove this node</button>
                            <button @click="addBeforeNode">add child before node</button>
                            <button @click="addAfterNode">add child after node</button>
                            <button @click="openChildren">open child node</button>
                            <button @click="closeChildren">close child node</button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <h2>Async Loading</h2>
        <div>
            <div style="width:840px; margin: 0 auto;">
                <div style="width:49%; display:inline-block; vertical-align: top;">
                    <v-jstree :data="asyncData" :async="loadData" show-checkbox multiple allow-batch whole-row @item-click="itemClick" ref="tree2"></v-jstree>
                </div>
                <div style="width:50%; display:inline-block; vertical-align: top;">
        <textarea  style="height:300px; width:100%;">
          {{asyncData}}
        </textarea>
                </div>
            </div>
        </div>
        <h2>Async Operation</h2>
        <div>
            <div style="width:840px; margin: 0 auto; height: 300px;">
                <button @click="refreshNode" >
                    refreshAsyncNode
                </button>
            </div>
        </div>
        <h2>Custom Tree Item</h2>
        <div>
            <div style="width:840px; margin: 0 auto;">
                <div style="width:49%; display:inline-block; vertical-align: top;">
                    <v-jstree :data="data"
                              :item-events="itemEvents"
                              show-checkbox
                              multiple
                              allow-batch
                              whole-row
                              draggable
                              @item-click="itemClick"
                              @item-drag-start="itemDragStart"
                              @item-drag-end="itemDragEnd"
                              @item-drop-before = "itemDropBefore"
                              @item-drop="itemDrop">
                        <template slot-scope="_">
                            <div style="display: inherit; width: 200px" @click.ctrl="customItemClickWithCtrl">
                                <i :class="_.vm.themeIconClasses" role="presentation" v-if="!_.model.loading"></i>
                                {{_.model.text}}
                                <button style="border: 0px; background-color: transparent; cursor: pointer;" @click="customItemClick(_.vm, _.model, $event)"><i class="fa fa-remove"></i></button>
                            </div>
                        </template>
                    </v-jstree>
                </div>
                <div style="width:50%; display:inline-block;">
        <textarea  style="height:300px; width:100%;">
          {{data}}
        </textarea>
                </div>
            </div>
        </div>
        <h3>Performace Test</h3>
        <div>
            <div style="width:840px; margin: 0 auto;">
                <div style="width:49%; display:inline-block; vertical-align: top;">
                    <p style="text-align:left">
                        <button @click="fillData">Add files to folder</button>
                        <input type="text" v-model="filesToAdd"/>
                    </p>
                    <v-jstree :data="data3"
                              show-checkbox
                              multiple
                              allow-batch
                              :allow-transition="false"
                              whole-row
                              @item-click="itemClick"
                              ref="tree3"></v-jstree>

                </div>
                <div style="width:50%; display:inline-block;">
                    <textarea  style="height:300px; width:100%;">
                      {{data3}}
                    </textarea>
                </div>
            </div>
        </div>
        <vue-context ref="menu">
            <li><a href="" @click.prevent="addChildNode">New</a></li>
            <li><a href="" @click.prevent="setAction('cut')">Cut</a></li>
            <li><a href="" @click.prevent="setAction('copy')">Copy</a></li>
            <li><a href="" @click.prevent="pasteNode" :class="{'paste-disabled' : !activeCutOrCopy}">Paste</a></li>
            <li><a href="" @click.prevent="removeNode">Delete</a></li>
        </vue-context>
    </div>
</template>

<script>

    import { VueContext } from 'vue-context';

    export default {
        name: 'app',
        components: {
            VueContext
        },
        data () {
            var vm = this;
            return {
                msg: 'A Tree Plugin For Vue2',
                searchText: '',
                editingItem: {},
                editingNode: null,
                cutNode : null,
                copyNode : null,
                itemEvents: {
                    mouseover: function () {
                        console.log('mouseover')
                    },
                    contextmenu: function (node,model,event) {
                        console.log(arguments[2])
                        arguments[2].preventDefault()
                        console.log('contextmenu')

                        // Mark active node
                        vm.editingNode = node;
                        vm.editingItem = node.model;

                        // Open the menu
                        vm.$refs.menu.open(event,model);
                    }
                },
                data: [
                    {
                        "text": "Same but with checkboxes",
                        "children": [
                            {
                                "text": "initially selected",
                                "selected": true
                            },
                            {
                                "text": "custom icon",
                                "icon": "fa fa-warning icon-state-danger"
                            },
                            {
                                "text": "initially open",
                                "icon": "fa fa-folder icon-state-default",
                                "opened": true,
                                "children": [
                                    {
                                        "text": "Another node"
                                    }
                                ]
                            },
                            {
                                "text": "custom icon",
                                "icon": "fa fa-warning icon-state-warning"
                            },
                            {
                                "text": "disabled node",
                                "icon": "fa fa-check icon-state-success",
                                "disabled": true
                            }
                        ]
                    },
                    {
                        "text": "Same but with checkboxes",
                        "opened": true,
                        "children": [
                            {
                                "text": "initially selected",
                                "selected": true
                            },
                            {
                                "text": "custom icon",
                                "icon": "fa fa-warning icon-state-danger"
                            },
                            {
                                "text": "initially open",
                                "icon": "fa fa-folder icon-state-default",
                                "opened": true,
                                "children": [
                                    {
                                        "text": "Another node"
                                    }
                                ]
                            },
                            {
                                "text": "custom icon",
                                "icon": "fa fa-warning icon-state-warning"
                            },
                            {
                                "text": "disabled node",
                                "icon": "fa fa-check icon-state-success",
                                "disabled": true
                            }
                        ]
                    },
                    {
                        "text": "And wholerow selection"
                    },
                    {
                        "text": "drag disabled",
                        "icon": "fa fa-warning icon-state-danger",
                        "dragDisabled": true
                    },
                    {
                        "text": "drop disabled",
                        "icon": "fa fa-warning icon-state-danger",
                        "dropDisabled": true
                    }
                ],
                data2: [
                    {
                        "text2": "Same but with checkboxes",
                        "children2": [
                            {
                                "text2": "initially selected",
                                "selected": true
                            },
                            {
                                "text2": "custom icon",
                                "icon": "fa fa-warning icon-state-danger"
                            },
                            {
                                "text2": "initially open",
                                "icon": "fa fa-folder icon-state-default",
                                "opened": true,
                                "children2": [
                                    {
                                        "text2": "Another node"
                                    }
                                ]
                            },
                            {
                                "text2": "custom icon",
                                "icon": "fa fa-warning icon-state-warning"
                            },
                            {
                                "text2": "disabled node",
                                "icon": "fa fa-check icon-state-success",
                                "disabled": true
                            }
                        ]
                    },
                    {
                        "text2": "Same but with checkboxes",
                        "opened": true,
                        "children2": [
                            {
                                "text2": "initially selected",
                                "selected": true
                            },
                            {
                                "text2": "custom icon",
                                "icon": "fa fa-warning icon-state-danger"
                            },
                            {
                                "text2": "initially open",
                                "icon": "fa fa-folder icon-state-default",
                                "opened": true,
                                "children2": [
                                    {
                                        "text2": "Another node"
                                    }
                                ]
                            },
                            {
                                "text2": "custom icon",
                                "icon": "fa fa-warning icon-state-warning"
                            },
                            {
                                "text2": "disabled node",
                                "icon": "fa fa-check icon-state-success",
                                "disabled": true
                            }
                        ]
                    },
                    {
                        "text2": "And wholerow selection"
                    }
                ],
                asyncData: [],
                loadData: function (oriNode, resolve) {
                    var id = oriNode.data.id ? oriNode.data.id : 0
                    setTimeout(() => {
                        let data = []
                        if (id > 200) {
                            data = []
                        }
                        else {
                            data = [
                                {
                                    "text": "New Item 1..." + id, "isLeaf": id > 100
                                },
                                {
                                    "text": "New Item 2..." + id, "isLeaf": id > 100
                                }
                            ]
                        }
                        resolve(data)
                    }, 500)
                },
                data3: [
                    {"text": "root"}
                ],
                filesToAdd: 1,
                filesToAddIndex: 0,
                multiTree:false
            }
        },
        computed: {
            activeCutOrCopy() {
                return this.cutNode !== null || this.copyNode !== null;
            }
        },
        methods: {
            setAction(action) {
                if(action === 'cut') {
                    this.cutNode = this.editingNode;
                    this. copyNode = null
                } else if (action === 'copy') {
                    // deepClone object to save current state of the copied node:
                    this.copyNode = JSON.parse(JSON.stringify(this.editingNode.model));
                }
            },
            onClickInMenu(txt) {
                console.log('You clicked: ' + txt);
            },
            /**
             * Get rid of the id property from the node and its children
             */
            idCleanup(item) {
                // Clone
                let newNode = Object.assign({}, item);
                // It's not a deep clone so children needs to be re-created
                newNode['children'] = [];
                // Get rid of the id so we can auto-increment new later
                delete newNode['id'];

                if(item.children.length) {
                    item.children.forEach(child => {
                        newNode.children.push(this.idCleanup(child));
                    })
                }

                return newNode;

            },
            pasteNode() {
                if( ! this.activeCutOrCopy) {
                    return;
                }

                if(this.copyNode) {
                    let stripped = this.idCleanup(this.copyNode);
                    this.editingItem.addChild(stripped);
                }

                if(this.cutNode) {
                    // clone it
                    let node = Object.assign({},this.cutNode);

                    if( this.editingItem === node.model) {
                        return;
                    }

                    // todo: replace with moveTo (?)
                    this.editingItem.addChild(node.model);
                    this.cutNode.model.deleteNode(this.cutNode);
                }

                this.cutNode = null;
            },
            itemClick (node) {
                this.editingNode = node
                this.editingItem = node.model
                console.log(node.model.text + ' clicked !')
            },
            itemDragStart (node,item,draggedItem) {
                this.currentDraggedItem = draggedItem;
                console.log(node.model.text + ' drag start !')
            },
            itemDragEnd (node) {
                console.log(node.model.text + ' drag end !')
            },
            itemDropBefore (node, item, draggedItem , e) {
                // If dropping an html element into the tree create a new node
                /*
                if(!draggedItem && this.$refs.tree.currentIsDraggable) {
                    item.addToPosition({
                        text: "newNode",
                        value: "newNode"
                    }, node);
                }*/
            },
            itemDrop (node, item) {
                /*
                var sortBy = function(attr,rev) {
                    if (rev == undefined) {
                        rev = 1;
                    } else {
                        rev = (rev) ? 1 : -1;
                    }
                    return function (a, b) {
                        a = a[attr];
                        b = b[attr];
                        if (a < b) {
                            return rev * -1;
                        }
                        if (a > b) {
                            return rev * 1;
                        }
                        return 0;
                    }
                }
                item.children.sort(sortBy('text', true))
                console.log(node.model.text + ' drop !')*/
            },
            inputKeyUp: function () {
                var text = this.searchText
                const patt = new RegExp(text);
                this.$refs.tree.handleRecursionNodeChilds(this.$refs.tree, function (node) {
                    if (text !== '' && node.model !== undefined) {
                        const str = node.model.text
                        if (patt.test(str)) {
                            node.$el.querySelector('.tree-anchor').style.color = 'red'
                        } else {
                            node.$el.querySelector('.tree-anchor').style.color = '#000'
                        } // or other operations
                    } else {
                        node.$el.querySelector('.tree-anchor').style.color = '#000'
                    }
                })
            },
            addChildNode: function () {
                if (this.editingItem.id !== undefined) {
                    this.editingItem.addChild({
                        text: "newNode"
                    })
                }
            },
            removeNode: function (item) {
                if (this.editingItem.id !== undefined) {
                    var index = this.editingNode.parentItem.indexOf(this.editingItem)
                    this.editingNode.parentItem.splice(index, 1)
                }
            },
            addBeforeNode: function () {
                if (this.editingItem.id !== undefined) {
                    this.editingItem.addBefore({
                        text: this.editingItem.text + " before"
                    }, this.editingNode)
                }
            },
            addAfterNode: function () {
                if (this.editingItem.id !== undefined) {
                    this.editingItem.addAfter({
                        text: this.editingItem.text + " after"
                    }, this.editingNode)
                }
            },
            openChildren: function () {
                if (this.editingItem.id !== undefined) {
                    this.editingItem.openChildren()
                }
            },
            closeChildren: function () {
                if (this.editingItem.id !== undefined) {
                    this.editingItem.closeChildren()
                }
            },
            refreshNode: function () {
                this.asyncData = [
                    this.$refs.tree2.initializeLoading()
                ]
                this.$refs.tree2.handleAsyncLoad(this.asyncData, this.$refs.tree2)
            },
            customItemClick: function (node ,item, e) {
                e.stopPropagation()
                var index = node.parentItem.indexOf(item)
                node.parentItem.splice(index, 1)
            },
            customItemClickWithCtrl: function () {
                console.log('click + ctrl')
            },
            fillData: function () {
                if (this.editingItem.id !== undefined) {
                    for (var i = 0; i < this.filesToAdd; i++) {
                        this.filesToAddIndex++
                        this.editingItem.addChild({
                            text: "File" + this.filesToAddIndex,
                            icon: "fa fa-file icon-state-danger"
                        })
                    }
                }
            }
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }

    div{
        display: block;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #EEE;
        font-size: 14px;
    }

    table th {
        background: #EEE;
        border-bottom: 1px solid #CCC;
        padding: 4px;
    }

    table td {
        border: 1px solid #EEE;
        padding: 4px;
    }
    .icon-state-default {
        color: gray;
    }
    .icon-state-danger {
        color: red;
    }
    .icon-state-warning {
        color: yellow;
    }
    .icon-state-success {
        color: green;
    }

    .paste-disabled {
        opacity: 0.3;
    }
</style>
