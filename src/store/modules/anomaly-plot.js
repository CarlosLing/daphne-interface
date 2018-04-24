import * as _ from "lodash-es";


const state = {
    activePlotTab: "oneVariable",

    colorAnomalyPlot: {
        default: 'rgba(110,110,110,255)',
        oneVariableStroke: 'rgba(110,110,110,255)',
        multiVariableStroke: 'rgba(50,50,110,0)',
        oneVariableAnomaly: 'rgba(255,0,0,255)'
    }
};

const getters = {
    getActivePlotTab(state) {
        return state.activePlotTab;
    },

    getColorAnomalyPlot(state) {
        return state.colorAnomalyPlot;
    }

};

const actions = {

};

// mutations
const mutations = {
    updateAnomalyPlotData(state, anomalyData) {
        state.plotAnomalyData = JSON.parse(anomalyData);
    },

    updateActivePlotTab(state, chosenTab) {
        state.activePlotTab = chosenTab;
    },

    updatePlotColors(state) {
        if (state.activePlotTab === "oneVariable"){
            state.colorAnomalyPlot = {
                oneVariableStroke: 'rgba(110,110,110,255)',
                multiVariableStroke: 'rgba(50,50,110,0)',
                oneVariableAnomaly: 'rgba(255,0,0,255)'
            }
        }else if(state.activePlotTab === "multiVariable"){
            state.colorAnomalyPlot = {
                oneVariableStroke: 'rgba(110,110,110,0)',
                multiVariableStroke: 'rgba(50,50,110,255)',
                oneVariableAnomaly: 'rgba(255,0,0,0)'
            }
        }
    },

    setOverlapColors(state, overlap) {
        if (overlap){
            if (state.colorAnomalyPlot.oneVariableStroke === 'rgba(110,110,110,0)') {
                state.colorAnomalyPlot.oneVariableStroke = 'rgba(200,200,200,255)'
            }
            if (state.colorAnomalyPlot.multiVariableStroke === 'rgba(50,50,110,0)') {
                state.colorAnomalyPlot.multiVariableStroke = 'rgba(150,150,255,255)'
            }
            if (state.colorAnomalyPlot.oneVariableAnomaly === 'rgba(255,0,0,0)') {
                state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,150,150,255)'
            }
        }
    }

};

export default {
    state,
    getters,
    actions,
    mutations
}
