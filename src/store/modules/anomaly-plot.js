import * as _ from "lodash-es";


const state = {
    plotAnomalyData: [],
    plotAnomalies: [],
    colorList: {
        default: 'rgba(110,110,110,255)',
        anomaly: 'rgba(255,0,0,255)'
    }
};

const getters = {
    getPlotAnomalyData(state) {
        return state.plotAnomalyData;
    },

    getPlotAnomalies(state) {
        return state.plotAnomalies;
    }
};

const actions = {
    updateAnomalyPlotData({commit}, problemData) {
        commit('updateAnomalyPlotData', problemData);
    }

};

// mutations
const mutations = {
    updateAnomalyPlotData(state, anomalyData) {
        state.plotAnomalyData = JSON.parse(anomalyData);
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}
