import VJstree from './tree.vue'
import useMultiTree from "./useMultiTree";
import useTreeActions from "./useTreeActions";
import VueCompositionApi from '@vue/composition-api'; // <---- get rid of this line

// Plugin install
VJstree.install = function(Vue,options = {}){
  Vue.use(VueCompositionApi); // <---- get rid of this line
  Vue.component(VJstree.name, VJstree);
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VJstree);
}

export { VJstree, useMultiTree, useTreeActions }