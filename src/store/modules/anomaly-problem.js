import store from "../index";
import {fetchPost} from "../../scripts/fetch-helpers";

// Defines the Name given to the anomaly score name from the algorithms output
let anomalyScoreName = "anomalyScore";

const state = {
    anomalyProblemData: [],
    anomalyVariables: [],
    anomalyVariablesCorrelation: [],
    anomalyVariablesCorrelationSpearman: [],
    allDetectedAnomalies: [],
    variableChosen: [],
    isRunning: false,

    // Algorithms for which an API was implemented
    methodsAPI: ["ADWindowedStats"],
    methodsWS: ["SARIMAX_AD", "adaptiveKNN", "iForest"],

    // Variables related to the AD Algorithm
    algorithmParameters: [],
    numberAnomaliesUni: 0, // Todo check how to compute this
    numberAnomaliesMulti: 0, // Todo check how to compute this
    detectedOneVarAnomalies:{},
    detectedMultiVarAnomalies:{},
    multiVariateAnomalyScores:{},
    websocketAD: {},

    oneVarAlgorithmSelected: 'none',
    multiVarAlgorithmSelected: 'none',

    // Variables related to the question asked
    dummyDrawAnomalies: false, // Switch to watch the changes of the detectedOneVarAnomalies
    questionParameters:[],
    questionParametersOption: [],
    questionParametersCheckbox: [],
    listSelectedVariables: [],
    writtenResponse:[],  // Contains the response of the questions organized in three points(intro, bulletpoints, postdata)
    questionExecuted: true
};

const getters = {
    getAnomalyProblemData(state) {
        return state.anomalyProblemData;
    },

    getOneVarAlgorithmSelected(state){
        return state.oneVarAlgorithmSelected;
    },

    getMultiVarAlgorithmSelected(state){
        return state.multiVarAlgorithmSelected;
    },

    getAnomalyScoreName() {
        return anomalyScoreName;
    },

    getIsRunning(state){
        return state.isRunning;
    },

    getAnomalyVariablesCorrelation(state){ // Todo Implement correlation functionality
        return state.anomalyVariablesCorrelation
    },

    getAnomalyVariablesCorrelationSpearman(state){
        return state.anomalyVariablesCorrelationSpearman
    },

    getAnomalyVariables(state) {
        return state.anomalyVariables;
    },

    getVariableChosen(state) {
        return state.variableChosen;
    },

    getDetectedOneVarAnomalies(state){
        return state.detectedOneVarAnomalies;
    },

    getDetectedMultiVarAnomalies(state){
        return state.detectedMultiVarAnomalies;
    },

    getNumberAnomaliesUni(state){
        return state.numberAnomaliesUni;
    },

    getNumberAnomaliesMulti(state){
        return state.numberAnomaliesMulti;
    },

    getDummyDrawAnomalies(state){
        return state.dummyDrawAnomalies;
    },

    getMultiVariateAnomalyScores(state){
        return state.multiVariateAnomalyScores;
    },

    getWrittenResponse(state){
        return state.writtenResponse;
    },

    getQuestionExecuted(state){
        return state.questionExecuted;
    }
};

const actions = {

    async detectAnomalies({state, getters, commit}, Method) {
        try {
            commit("updateIsRunning", true); // To give the user feedback on the algorithm execution

            // Adds the data
            let reqData = {data: JSON.stringify(getters.getAnomalyProblemData)};

            // Adds the Variable we are focusing on
            reqData['variable'] = getters.getVariableChosen;
            // Add the parameters to the request
            state.algorithmParameters.forEach((parameter) => {
                if (parameter.varType === "int") {
                    reqData[parameter.variable] = parseInt(parameter.value);
                }
                else if (parameter.varType === "float"){
                    reqData[parameter.variable] = parseFloat(parameter.value);
                }
            });

            if (state.methodsAPI.includes(Method)) {
                console.log(reqData);
                let dataResponse = await fetchPost('/api/anomaly/' + Method, reqData, true);

                if (dataResponse.ok) {
                    let data = await dataResponse.json();
                    if (data.includes('error')) { // Todo try if errors are working properly
                        // console.error('Internal Algorithm error: ' + data['error']);
                        // TODO: Implement this to show it on the web
                    }
                    else {
                        commit("updateIsRunning", false);
                        if(getters.isAlgorithmMultiVariate(Method)){
                            commit("updateMultiVariateAnomalyScores", {
                                'algorithm': Method,
                                'anomalyScore': JSON.parse(data)
                            })
                        }
                        else {
                            commit("updateDetectedOneVarAnomalies", {
                                'variable': reqData['variable'],
                                'algorithm': Method,
                                'anomalies': JSON.parse(data)
                            });
                        }
                    }
                }
                else {
                    // console.error('Error accessing the data');
                }

            }
            else if (state.methodsWS.includes(Method)){

                const websocketPromise = new Promise((resolve, reject) => {

                    // Websocket connection
                    let websocket = new WebSocket(((window.location.protocol === 'https:') ? 'wss://' : 'ws://')
                        + window.location.host + '/api/anomaly/' + Method);

                    websocket.onopen = function() {
                        resolve();
                    };

                    websocket.onmessage = function (message) {
                        let data = JSON.parse(message.data);
                        if (data.includes('error')) {
                            // console.error('Internal Algorithm error: ' + data['error']);
                            // TODO: Implement this to show it on the web
                        }
                        else {
                            commit("updateIsRunning", false);
                            if(getters.isAlgorithmMultiVariate(Method)){
                                commit("updateMultiVariateAnomalyScores",{
                                    'algorithm': Method,
                                    'anomalyScore': JSON.parse(data)
                                })
                            }
                            else {
                                commit("updateDetectedOneVarAnomalies", {
                                    'variable': reqData['variable'],
                                    'algorithm': Method,
                                    'anomalies': JSON.parse(data)
                                });
                            }
                            commit("switchDrawAnomalies");
                        }
                    };
                    store.commit('setWebsocketAD', {websocket: websocket, variable: reqData['variable']});

                });
                // On the answer of the websocket
                websocketPromise.then(() => {
                    state.websocketAD[reqData['variable']].send(JSON.stringify(reqData));
                });
            }
        }
        catch (e) {
            // console.error("Networking error: ", e)
        }
    },

    async loadAnomalyData({commit, getters}, fileName) {
        try {
            let reqData = new FormData();
            reqData.append('filename', fileName);

            let dataResponse = await fetchPost('/api/anomaly/import-data', reqData);

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('updateAnomalyData', data['data']);  // Todo simplify by declaring it in a function
                commit('updateAnomalyVariables', data['variables']);
                commit('updateAnomalyVariablesCorrelation', data['correlation']);
                commit('updateAnomalyVariablesCorrelationSpearman', data['correlationSpearman']);
                commit('initializeAlgorithmsResultVectors', getters.getOptionsListAlgorithm);
            }
            else{
                // console.error('Error accessing the data');
            }
        }
        catch (e) {
            // console.error('Networking error: ', e);

        }
    },

    async loadAnomalyDataFromFile({commit, getters}, file) {
        try {
            let reqData = new FormData();
            reqData.append('file', file);

            let dataResponse = await fetchPost('/api/anomaly/read-data', reqData);

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('updateAnomalyData', data['data']);
                commit('updateAnomalyVariables', data['variables']);
                commit('updateAnomalyVariablesCorrelation', data['correlation']);
                commit('updateAnomalyVariablesCorrelationSpearman', data['correlationSpearman']);
                commit('initializeAlgorithmsResultVectors', getters.getOptionsListAlgorithm);
            }
            else{
                // console.error('Error accessing the data');
            }
        }
        catch (e) {
            // console.error('Networking error: ', e);

        }
    },

    async answerAnomalyQuestion({commit, getters, state}, questionCode) {
        try{
            // commit("updateIsRunning", true); // Todo give the user feedback on the analysis execution
            // Adds the data
            let reqData = {
                data: JSON.stringify(getters.getAnomalyProblemData),
                variable: getters.getVariableChosen,
                selectedMultiVarAlgorithm: getters.getMultiVarAlgorithmSelected,
                anomalyScore: getters.getMultiVariateAnomalyScores,
                detectedOneVarAnomalies: getters.getDetectedOneVarAnomalies,
                detectedMultiVarAnomalies: getters.getDetectedMultiVarAnomalies,
                correlation: getters.getAnomalyVariablesCorrelation,
                correlationSpearman: getters.getAnomalyVariablesCorrelationSpearman,
                selectedData: getters.getSelectedData,
                database: getters.getAnomalyDatabase,
                listSelectedVariables: state.listSelectedVariables
            };

            // Add the parameters to the request
            state.questionParameters.forEach((parameter) => {
                if (parameter.varType === "int") {
                    reqData[parameter.variable] = parseInt(parameter.value);
                }
                else if (parameter.varType === "float"){
                    reqData[parameter.variable] = parseFloat(parameter.value);
                }
            });

            state.questionParametersOption.forEach((parameter) => {
                reqData[parameter.variable + parameter.subIndex] = parameter.value;
                if (parameter.type === "Algorithm"){
                    reqData["typeAlgorithm" + parameter.subIndex] = getters.getOptionsListAlgorithm[parameter.value].type;
                }
            });

            state.questionParametersCheckbox.forEach((parameter) => {
                reqData[parameter.variable] = parameter.value;
            });

            let dataResponse = await fetchPost('/api/anomaly/analysis/' + questionCode, reqData, true);

            // Process response
            if (dataResponse.ok) {
                let data = await dataResponse.json();
                if (data.hasOwnProperty('error')) {
                    // console.error('Internal Algorithm error: ' + data['error']);
                    // TODO: Implement this to show it on the web
                }
                else {
                    // Commits the response to be shown in Daphne interface
                    if(data.hasOwnProperty('writtenResponse')){
                        commit("updateWrittenResponse", data['writtenResponse']);
                    }
                    if(data.hasOwnProperty('detectedAnomalies')){
                        commit('updateDetectedMultiVarAnomalies', JSON.parse(data['detectedAnomalies']));
                    }
                    if(data.hasOwnProperty('data')){
                        commit('updateAnomalyData', data['data']['data']);
                        commit('updateAnomalyVariables', data['data']['variables']);
                        commit('updateAnomalyVariablesCorrelation', data['data']['correlation']);
                        commit('updateAnomalyVariablesCorrelationSpearman', data['data']['correlationSpearman']);
                        commit('initializeAlgorithmsResultVectors', getters.getOptionsListAlgorithm);
                    }
                    commit('switchDrawAnomalies');
                    commit('updateQuestionExecuted', true);
                }
            }
            else {
                // console.error('Error accessing the data');
            }
        }

        catch (e) {
            // console.error("Networking error: ", e);

        }
    }
};

const mutations = {
    updateIsRunning(state, newState){
        state.isRunning = newState;
    },

    updateOneVarAlgorithmSelected(state, algorithmCode){
        state.oneVarAlgorithmSelected = algorithmCode;
    },

    updateMultiVarAlgorithmSelected(state, algorithmCode){
        state.multiVarAlgorithmSelected= algorithmCode;
    },

    updateAnomalyData(state, anomalyData) {
        state.anomalyProblemData = anomalyData
    },

    updateAnomalyVariables(state, anomalyVariables) {
        state.anomalyVariables = anomalyVariables
    },

    updateAnomalyVariablesCorrelation(state, correlations){
        state.anomalyVariablesCorrelation = correlations
    },

    updateAnomalyVariablesCorrelationSpearman(state, correlations){
        state.anomalyVariablesCorrelationSpearman = correlations
    },

    initializeAlgorithmsResultVectors(state, optionsListAlgorithm){
        state.detectedOneVarAnomalies = {};
        state.anomalyVariables.forEach((variable)=>{
            state.detectedOneVarAnomalies[variable] = {};
            for (var algorithm in optionsListAlgorithm){
                if(optionsListAlgorithm[algorithm].type === 'UniVariate' || algorithm === 'none'){
                    state.detectedOneVarAnomalies[variable][optionsListAlgorithm[algorithm].value] = [];
                }
            }
        });
        state.multiVariateAnomalyScores = {};
        state.detectedMultiVarAnomalies = {};
        state.multiVariateAnomalyScores['none'] = [];
        for (var algorithm in optionsListAlgorithm){
            if(optionsListAlgorithm[algorithm].type === 'MultiVariate' || algorithm === 'none'){
                state.multiVariateAnomalyScores[optionsListAlgorithm[algorithm].value] = [];
                state.detectedMultiVarAnomalies[optionsListAlgorithm[algorithm].value] = [];
            }
        }
    },

    updateDetectedOneVarAnomalies(state, updateParameters){
        state.detectedOneVarAnomalies[updateParameters.variable][updateParameters.algorithm] = updateParameters.anomalies;
    },

    updateDetectedMultiVarAnomalies(state, detectedAnomalies){
        state.detectedMultiVarAnomalies[state.multiVarAlgorithmSelected] = detectedAnomalies;
    },

    updateAlgorithmParameters(state, algorithmParameters){
        state.algorithmParameters = algorithmParameters;
    },

    updateQuestionParameters(state, questionParameters) {
        state.questionParameters = questionParameters;
    },

    updateQuestionParametersOption(state, questionParametersOption) {
        state.questionParametersOption = questionParametersOption;
    },

    updateQuestionParametersCheckbox(state, questionParametersCheckbox) {
        state.questionParametersCheckbox= questionParametersCheckbox;
    },

    updateWrittenResponse(state, writtenResponse) {
        state.writtenResponse = writtenResponse;
    },


    updateMultiVariateAnomalyScores(state, updateParameters){
        state.multiVariateAnomalyScores[updateParameters.algorithm] = updateParameters.anomalyScore;
    },

    setWebsocketAD(state, dataWS) {
        state.websocketAD[dataWS['variable']] = dataWS['websocket'];
    },

    switchDrawAnomalies(state){
        state.dummyDrawAnomalies = ! state.dummyDrawAnomalies;
    },

    updateVariableChosen(state, variable) {
        state.variableChosen = variable;
    },

    updateQuestionExecuted(state, status){
        state.questionExecuted = status;
    },

    updateListSelectedVariables(state, listSelectedVariables){
        state.listSelectedVariables = listSelectedVariables;
    },

    updateNumberAnomalies(state){
        state.numberAnomaliesUni = state.detectedOneVarAnomalies[state.variableChosen][state.oneVarAlgorithmSelected].length;
        state.numberAnomaliesMulti = state.detectedMultiVarAnomalies[state.multiVarAlgorithmSelected].length;
    }

};

export default {
    state,
    getters,
    actions,
    mutations
}
