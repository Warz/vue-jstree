<template>
    <li role="treeitem"
        :class="classes"
        :draggable="draggable"
        @dragstart.stop="onItemDragStart($event, _self, _self.model)"
        @dragend.stop.prevent="onThisItemDragEnd($event, _self, _self.model)"
        @dragover.stop.prevent="onItemDragOver($event, _self, _self.model)"
        @dragenter.stop.prevent="onDragState(true)"
        @dragleave.stop.prevent="onDragState(false)"
        @drop.stop.prevent="handleItemDrop($event, _self, _self.model)">
        <div role="presentation" :class="wholeRowClasses" v-if="isWholeRow">&nbsp;</div>
        <div :class="dropCss"></div>
        <i class="tree-icon tree-ocl" role="presentation" @click="handleItemToggle"></i>
        <div :class="anchorClasses" @click.exact="handleItemClick" v-on="events">
            <i class="tree-icon tree-checkbox" role="presentation" v-if="showCheckbox && !model.loading"></i>
            <slot :vm="this" :model="model">
                <i :class="themeIconClasses" role="presentation" v-if="!model.loading"></i>
                <span v-html="model[textFieldName]"></span>
            </slot>
        </div>
        <ul role="group" ref="group" class="tree-children" v-if="isFolder" :style="groupStyle">
            <tree-item v-for="(child, index) in model[childrenFieldName]"
                       :key="index"
                       :data="child"
                       :text-field-name="textFieldName"
                       :value-field-name="valueFieldName"
                       :children-field-name="childrenFieldName"
                       :item-events="itemEvents"
                       :whole-row="wholeRow"
                       :show-checkbox="showCheckbox"
                       :allow-transition="allowTransition"
                       :height= "height"
                       :parent-item="model[childrenFieldName]"
                       :draggable="draggable"
                       :drag-over-background-color="dragOverBackgroundColor"
                       :on-item-click="onItemClick"
                       :on-item-toggle="onItemToggle"
                       :on-item-drag-start="onItemDragStart"
                       :on-item-drag-end="onItemDragEnd"
                       :on-item-drop="onItemDrop"
                       :klass="index === model[childrenFieldName].length-1?'tree-last':''"
                       :expand-timer="expandTimer"
                       :expand-timer-time-out="expandTimerTimeOut"
                       :show-drop-position="showDropPosition"
                       :allowed-to-drop="allowedToDrop"
                       :current-is-draggable="currentIsDraggable"
            >
                <template slot-scope="_">
                    <slot :vm="_.vm" :model="_.model">
                        <i :class="_.vm.themeIconClasses" role="presentation" v-if="!model.loading"></i>
                        <span v-html="_.model[textFieldName]"></span>
                    </slot>
                </template>
            </tree-item>
        </ul>
    </li>
</template>
<script>
  import VueTimers from 'vue-timers/mixin';
  import { timer } from 'vue-timers'
  const DropPosition = {
      empty: '0',
      up: '1',
      inside: '2',
      down: '3'
  }
  export default {
      name: 'TreeItem',
      timers: {
          expand: { time: 1, autostart: false }
      },
      mixins: [VueTimers],
      props: {
          data: {type: Object, required: true},
          textFieldName: {type: String},
          valueFieldName: {type: String},
          childrenFieldName: {type: String},
          itemEvents: {type: Object},
          wholeRow: {type: Boolean, default: false},
          showCheckbox: {type: Boolean, default: false},
          allowTransition: {type: Boolean, default: true},
          height: {type: Number, default: 24},
          parentItem: {type: Array},
          draggable: {type: Boolean, default: false},
          dragOverBackgroundColor: {type: String},
          onItemClick: {
              type: Function, default: () => false
          },
          onItemToggle: {
              type: Function, default: () => false
          },
          onItemDragStart: {
              type: Function, default: () => false
          },
          onItemDragEnd: {
              type: Function, default: () => false
          },
          allowedToDrop: {
              type: Function, default: () => true
          },
          onItemDrop: {
              type: Function, default: () => false
          },
          klass: String,
          expandTimer:{type: Boolean, default: false},
          expandTimerTimeOut:{type: Number, default: 1500},
          showDropPosition:{type: Boolean, default: true},
          currentIsDraggable: { type: Boolean }
      },
      data () {
          return {
              isHover: false,
              isDragEnter: false,
              isSelected:false,
              model: this.data,
              maxHeight: 0,
              events: {},
              dropPosition: '0',
              dropCss: '',
          }
      },
      watch: {

          isHover(newValue){

          //    console.log('isHover:',newValue);
              if(newValue){
                  // if current dragged item is not set, we're dealing with an item that cant be dragged, so dont show background on targets
                  if(this.currentIsDraggable) {
                      this.$el.style.backgroundColor = this.dragOverBackgroundColor;
                  }
              }else{
                  //this.$el.style.backgroundColor = "inherit"
                  this.$el.style.backgroundColor = '';
              }
          },
          isDragEnter(newValue){

              if(newValue){
                  // if current dragged item is not set, we're dealing with an item that cant be dragged, so dont show background on targets
                  if(this.currentIsDraggable) {
                      this.$el.style.backgroundColor = this.dragOverBackgroundColor;
                  }
              }else{
                  //this.$el.style.backgroundColor = "inherit"
                  this.$el.style.backgroundColor = '';
              }
          },
          dropPosition(newValue){
              if (newValue !== '0') {
                  this.$timer.start('expand');
              } else {
                  this.$timer.stop('expand');
              }
          },
          data (newValue) {
              this.model = newValue
          },
          'model.opened': {
              handler: function (val, oldVal) {
                  this.onItemToggle(this, this.model)
                  this.handleGroupMaxHeight()
              },
              deep: true
          },
      },
      computed: {
          isFolder () {
              return this.model[this.childrenFieldName] && this.model[this.childrenFieldName].length
          },
          classes () {
              return [
                  {'tree-node': true},
                  {'tree-open': this.model.opened},
                  {'tree-closed': !this.model.opened},
                  {'tree-leaf': !this.isFolder},
                  {'tree-loading': !!this.model.loading},
                  {'tree-drag-enter': this.isDragEnter},
                  {'tree-drag-disabled': this.model.dragDisabled},
                  {[this.klass]: !!this.klass}
              ]
          },
          anchorClasses () {
              return [
                  {'tree-anchor': true},
                  {'tree-disabled': this.model.disabled},
                  {'tree-selected': this.model.selected},
                  {'tree-hovered': this.isHover}
              ]
          },
          wholeRowClasses () {
              return [
                  {'tree-wholerow': true},
                  {'tree-wholerow-clicked': this.model.selected},
                  {'tree-wholerow-hovered': this.isHover}
              ]
          },
          themeIconClasses () {
              return [
                  {'tree-icon': true},
                  {'tree-themeicon': true},
                  {[this.model.icon]: !!this.model.icon},
                  {'tree-themeicon-custom': !!this.model.icon}
              ]
          },
          isWholeRow () {
              if (this.wholeRow) {
                  if (this.$parent.model === undefined) {
                      return true
                  } else if (this.$parent.model.opened === true) {
                      return true
                  } else {
                      return false
                  }
              }
          },
          groupStyle () {
              return {
                  'position': this.model.opened ? '' : 'relative',
                  'max-height': !!this.allowTransition ? this.maxHeight + 'px' : '',
                  'transition-duration': !!this.allowTransition ? Math.ceil(this.model[this.childrenFieldName].length / 100) * 300 + 'ms' : '',
                  'transition-property': !!this.allowTransition ? 'max-height' : '',
                  'display': !!this.allowTransition ? 'block' : (this.model.opened ? 'block' : 'none')
              }
          }
      },
      beforeMount(){
          this.timers.expand.time = this.expandTimerTimeOut;
      },
      methods: {
          expand () {
              if(this.expandTimer){
                  this.handleItemToggle();
              }
          },
          onThisItemDragEnd (e, _self, model) {
              this.dropPosition = '0';
              this.dropCss = '';
              this.onItemDragEnd(e, _self, model)
          },
          onDragState (entered) {

              if (entered) {
                  this.isDragEnter = true;
              } else {
                  this.isDragEnter = false;
                  // when we leave item (drag outside of it) clear all the css (green arrow etc)
                  this.dropPosition = '0';
                  this.dropCss = '';
              }
          },
          handleItemToggle (e) {
              if (this.isFolder) {
                  this.model.opened = !this.model.opened
              }
          },
          handleGroupMaxHeight () {
              if (!!this.allowTransition) {
                  let length = 0;
                  let childHeight = 0;
                  if (this.model.opened) {
                      length = this.$children.length;
                      for (let children of this.$children) {
                          childHeight += children.maxHeight;
                      }
                  }
                  this.maxHeight = length * this.height + childHeight;
                  if (this.$parent.$options._componentTag === 'tree-item') {
                      this.$parent.handleGroupMaxHeight();
                  }
              }
          },
          handleItemClick (e) {
              if (this.model.disabled) return;
              this.model.selected = !this.model.selected;
              this.onItemClick(this, this.model, e)
          },
          handleItemMouseOver () {
              this.isHover = true
          },
          handleItemMouseOut () {
              this.isHover = false
          },
          handleItemDrop (e, oriNode, oriItem) {
              this.$el.style.backgroundColor = "inherit";
              this.onItemDrop(e, oriNode, oriItem, this.dropPosition);
              this.dropPosition = '0';
              this.dropCss = '';
          },
          /**
           * Calculate position based on where user has placed mouse
           * @param pageY
           * @param offsetTop
           * @param offsetHeight
           * @param checkDropPermission bool (default false)
           * @returns {string}
           */
          getDropPosition (pageY, offsetTop, offsetHeight,checkDropPermission) {
              // 340 - 326 = top = 14. height = 24
              const top = pageY - offsetTop;
              checkDropPermission = checkDropPermission || false;

              let canDrop = true;

              if(checkDropPermission) {
                  canDrop = !this.model.dropDisabled;
              }

              if (canDrop) {

                  if (top < offsetHeight / 3) {
                      return DropPosition.up
                  } else if (top > offsetHeight * 2 / 3) {
                      return DropPosition.down
                  } else {
                      return DropPosition.inside
                  }

              } else {

                  if (top < offsetHeight / 2) {
                      return DropPosition.up
                  } else {
                      return DropPosition.down
                  }
              }
          },
          onItemDragOver (e, oriNode, oriItem) {

                this.isDragEnter = true;

                //if (!oriItem.edited) {
                const oriPoz = oriNode.$el.getBoundingClientRect();
                const position = this.getDropPosition(e.clientY, oriPoz.top, 24).toString();

                // only run when we actually change position (this.dropPosition is previous):
                if (this.dropPosition !== position) {
                    this.dropPosition = position;

                    var dropCss ='';

                    // If we're not allowed to drag the item we're currently dragging then just hide the market completely
                    if(this.currentIsDraggable) {
                        dropCss = 'tree-marker-' + position
                    }

                    if (!this.allowedToDrop(oriItem, position)) {

                        if(this.currentIsDraggable) {

                            if(position === DropPosition.inside) {
                                // set background color to red to indicate that dropping here is not allowed
                                oriNode.$el.style.backgroundColor = '#ff928d';

                                // hide the green arrow marker/pointer when trying to drop into it:
                                // dropCss += ' not-allowed'
                            } else {
                                oriNode.$el.style.backgroundColor = this.dragOverBackgroundColor;
                            }
                      }

                  } else {
                      oriNode.$el.style.backgroundColor = this.dragOverBackgroundColor;
                  }

                  if(this.showDropPosition){
                      this.dropCss = dropCss;
                  }
              }
          },
      },
      created () {
          const self = this
          const events = {
              'mouseover': this.handleItemMouseOver,
              'mouseout': this.handleItemMouseOut
          }
          for (let itemEvent in this.itemEvents) {
              let itemEventCallback = this.itemEvents[itemEvent]
              if (events.hasOwnProperty(itemEvent)) {
                  let eventCallback = events[itemEvent]
                  events[itemEvent] = function (event) {
                      eventCallback(self, self.model, event)
                      itemEventCallback(self, self.model, event)
                  }
              } else {
                  events[itemEvent] = function (event) {
                      itemEventCallback(self, self.model, event)
                  }
              }
          }
          this.events = events
      },
      mounted () {
          this.handleGroupMaxHeight()
      }
  }
</script>
