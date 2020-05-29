import VJstree from './tree.vue'
import useMultiTree from "./useMultiTree";
import useTreeActions from "./useTreeActions";

// todo: is these 3 lines necessary in here? i can't figure out how to get rid of them
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

VJstree.install = function(Vue){
  Vue.component(VJstree.name, VJstree);
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VJstree);
}

export default VJstree;
export { VJstree, useMultiTree, useTreeActions }