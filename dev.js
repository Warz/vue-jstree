import Vue from 'vue'

import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

import VJstree from './src/index.js'
Vue.use(VJstree)

import App from './App.vue'

new Vue({
    el: '#app',
    render: h => h(App)
})
