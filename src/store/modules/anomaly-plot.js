import * as _ from "lodash-es";
const mouseRange = 2;

const state = {
    activePlotTab: "oneVariable",
    anomalyPlotData: [],

    colorAnomalyPlot: {
        default: 'rgba(110,110,110,255)',
        oneVariableStroke: 'rgba(50,50,50,1)',
        multiVariableStroke: 'rgba(30,30,75,0)',
        oneVariableAnomaly: 'rgba(255,0,0,0.5)',
        multiVariableAnomaly: 'rgba(200,0,200,0.5)',
        indicatorStroke: 'rgba(200,200,200,1)',
        clickedData: 'rgba(255,200,200,1)',
        selectedData: 'rgba(100,100,120,0.5)'
    },

    activeMouseInterval: [], //
    mouseRange: 2, // indicates the interval on which
    hoveredData: {
        dataPoint: [],
        anomalyScore: []
    },
    clickedData: {
        dataPoint: [],
        anomalyScore: []
    },
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
        commit('clearSelectedData'); // Todo avoid this when a multivariate method is performed
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
            state.colorAnomalyPlot.oneVariableStroke = 'rgba(50,50,50,1)';
            state.colorAnomalyPlot.multiVariableStroke = 'rgba(30,30,75,0)';
            state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,0,0,0.5)';
            state.colorAnomalyPlot.multiVariableAnomaly= 'rgba(200,0,200,0)';
        }else if(state.activePlotTab === "multiVariable"){
            state.colorAnomalyPlot.oneVariableStroke = 'rgba(50,50,50,0)';
            state.colorAnomalyPlot.multiVariableStroke = 'rgba(30,30,75,1)';
            state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,0,0,0)';
            state.colorAnomalyPlot.multiVariableAnomaly = 'rgba(200,0,200,0.5)';
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
            if (state.colorAnomalyPlot.oneVariableStroke === 'rgba(50,50,50,0)') {
                state.colorAnomalyPlot.oneVariableStroke = 'rgba(200,200,200,1)'
            }
            if (state.colorAnomalyPlot.multiVariableStroke === 'rgba(30,30,75,0)') {
                state.colorAnomalyPlot.multiVariableStroke = 'rgba(190,190,230,1)'
            }
            if (state.colorAnomalyPlot.oneVariableAnomaly === 'rgba(255,0,0,0)') {
                state.colorAnomalyPlot.oneVariableAnomaly = 'rgba(255,150,150,0.5)'
            }
            if (state.colorAnomalyPlot.multiVariableAnomaly === 'rgba(200,0,200,0)') {
                state.colorAnomalyPlot.multiVariableAnomaly = 'rgba(255,150,255,0.5)'
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
        state.clickedData = {
            dataPoint: [],
            anomalyScore: []
        };
    }


};


export default {
    state,
    getters,
    actions,
    mutations
}
