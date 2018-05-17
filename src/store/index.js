import Vue from 'vue';
import Vuex from 'vuex';
import problem from './modules/problem';
import tradespacePlot from './modules/tradespace-plot';
import functionalityList from './modules/functionality-list';
import daphne from './modules/daphne';
import dataMining from './modules/data-mining';
import filter from './modules/filter';
import featureApplication from './modules/feature-application';
import experiment from './modules/experiment';
// Anomaly code
import anomaly from './modules/anomaly-problem';
import anomalyPlot from './modules/anomaly-plot';
import anomalyInfo from './modules/anomaly-info';
import anomalyDiagnose from './modules/anomaly-diagnose';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
        websocket: null
    },
    getters: {
        getWebsocket(state) {
            return state.websocket;
        }
    },
    mutations: {
        setWebsocket(state, websocket) {
            state.websocket = websocket;
        },
    },
    actions: {},
    modules: {
        daphne,
        problem,
        tradespacePlot,
        anomaly,
        anomalyPlot,
        anomalyInfo,
        anomalyDiagnose,
        functionalityList,
        dataMining,
        filter,
        featureApplication,
        experiment
    },
    strict: debug
});
