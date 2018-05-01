import * as _ from "lodash-es";
const mouseRange = 2;

const state = {
    activePlotTab: "oneVariable",
    anomalyPlotData: [],

    colorAnomalyPlot: {
        default: 'rgba(110,110,110,255)',
        oneVariableStroke: 'rgba(110,110,110,1)',
        multiVariableStroke: 'rgba(50,50,110,0)',
        oneVariableAnomaly: 'rgba(255,0,0,1)',
        indicatorStroke: 'rgba(200,200,200,1)',
        clickedData: 'rgba(255,200,200,1)',
        selectedData: 'rgba(200,200,255,0.5)'
    },

    activeMouseInterval: [], //
    mouseRange: 2, // indicates the interval on which
    hoveredData: [],
    clickedData: [],
    selectedData: [],
    preMappedX: [] // PreMapped X to avoid slow time parsing
};

const getters = {
    getActivePlotTab(state) {
        return state.activePlotTab;
    },

    getClickedData(state){
        return state.clickedData;
    },

    getColorAnomalyPlot(state) {
        return state.colorAnomalyPlot;
    },

    getActiveMouseInterval(state) {
        return state.activeMouseInterval;
    },

    getHoveredData(state) {
        return state.hoveredData;
    },

    getSelectedData(state) {
        return state.selectedData;
    },

    getPreMappedX(state){
        return state.preMappedX;
    }

};

const actions = {
    updateAnomalyPlotData({commit}, problemData) {

        commit('updateAnomalyPlotData', problemData);

        // initializes auxiliary variables
        commit('clearSelectedData');
        commit('initPreMappedX');
    }
};





// mutations
const mutations = {

    updateAnomalyPlotData(state, problemData) {
        state.anomalyPlotData = problemData;
    },

    updateActivePlotTab(state, chosenTab) {
        state.activePlotTab = chosenTab;
    },

    updatePlotColors(state) {
        if (state.activePlotTab === "oneVariable"){
            state.colorAnomalyPlot.oneVariableStroke = 'rgba(110,110,110,1)';
            state.colorAnomalyPlot.multiVariableStroke = 'rgba(50,50,110,0)';
            state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,0,0,1)';
        }else if(state.activePlotTab === "multiVariable"){
            state.colorAnomalyPlot.oneVariableStroke = 'rgba(110,110,110,0)';
            state.colorAnomalyPlot.multiVariableStroke = 'rgba(50,50,110,1)';
            state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,0,0,0)';
        }
    },

    updateActiveMouseInterval (state, x) {
        state.activeMouseInterval = [x - mouseRange, x + mouseRange];
    },

    updateHoveredData (state, data) {
        state.hoveredData = data;
    },

    updateSelectedData(state, selectedData){
        state.selectedData = selectedData;
    },

    setClickedData(state){
        state.clickedData = state.hoveredData;
    },

    setOverlapColors(state, overlap) {
        if (overlap){
            if (state.colorAnomalyPlot.oneVariableStroke === 'rgba(110,110,110,0)') {
                state.colorAnomalyPlot.oneVariableStroke = 'rgba(200,200,200,1)'
            }
            if (state.colorAnomalyPlot.multiVariableStroke === 'rgba(50,50,110,0)') {
                state.colorAnomalyPlot.multiVariableStroke = 'rgba(150,150,255,1)'
            }
            if (state.colorAnomalyPlot.oneVariableAnomaly === 'rgba(255,0,0,0)') {
                state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,150,150,1)'
            }
        }
    },

    clearSelectedData(state){
        state.selectedData = [];
        state.selectedData.length = state.anomalyPlotData.length;
        state.selectedData.fill(false);
    },

    initPreMappedX(state){
        state.preMappedX = [];
        state.preMappedX.length = state.anomalyPlotData.length;
        state.preMappedX.fill(0);
    },

    calculatePreMappedX(state, xMapper){
        state.anomalyPlotData.forEach((point, index) => {
            state.preMappedX[index] = xMapper(point);
        })
    },

    clearClickedData(state){
        state.clickedData = [];
    }


};


export default {
    state,
    getters,
    actions,
    mutations
}
