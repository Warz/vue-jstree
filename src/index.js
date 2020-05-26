/**
 * Created by virus_zhh on 2017/9/29.
 */
import VJstree from './tree.vue'
import VueCompositionApi from '@vue/composition-api';

VJstree.install = function(Vue){
  Vue.component(VJstree.name, VJstree)
  Vue.use(VueCompositionApi);
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VJstree);

}



export default VJstree

