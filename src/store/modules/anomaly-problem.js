import store from "../index";

// Defines all algorithms Parameters and characteristics
let algorithmsInfo = new Map();

// Note that new algorithms must be included in the Option list of Anomaly Detection in './functionality-list.js'
algorithmsInfo.set('none', {
    name: "No Algorithm has been selected"
});

algorithmsInfo.set('ADWindowedStats', {
    name: "Windowed Statistic Method",
    type: "UniVariate",
    code: 'ADWindowedStats',
    parameters:[
        {name: "Window Parameter", variable: "w", defaultValue: 100, value: 100, varType:"int",
            description: "Fixes the number of observations before the data to be analyzed. \nA higher number implies the anomaly detected is an outlier in a more general context, while a smaller number will imply that the anomaly is local"},
        {name: "Threshold in STD", variable: "tstd", defaultValue: 3, value: 3, varType:"float",
            description: "Fixes the degree of confidence with which we classify the data as an anomaly. A higher threshold means we are detecting extremer outliers"}],
    characteristics: [
        {description: "Target: the main target of this method is the detection of values which represent an outlier of the w previous methods"},
        {description: "Time consuming: The method is lightweight, for each data point a "}

    ]
});

algorithmsInfo.set('SARIMAX_AD', {
    name: "Seasonal ARIMA + Exogenous Variables",
    type: "UniVariate",
    code: 'SARIMAX_AD',
    parameters:[
        {name: "Seasonality", variable: "seasonality", defaultValue: 24, value: 24, varType:"int",
            description: "Indicates the seasonality assumed for the data. This means that the data is considered " +
            "to be related with the n element"},
        {name: "Confidence interval", variable: "ci_alpha", defaultValue: 0.01, value: 0.01, varType:"float",
            description: "Fixes the degree of confidence with which we classify the data as an anomaly. A lower " +
            "value implies a higher confidence on the anomalies detected. This value must be between 0 and 1"},
        {name: "Minimum Correlation", variable: "min_cor", defaultValue: 1, value: 1, varType:"float",
            description: "Refers to the minimum correlation with the chosen variable that another variable must have " +
            "to be included in the prediction model used to predict the anomaly. Therefore 1 means no other variable " +
            "is included, an 0 means all variables are. WARNING: too much variables included might worsen the " +
            "prediction or even prevent convergence"},
        {name: "Auto Regression and Moving average parameters range", variable: "range_pq", defaultValue: 3, value:3,
            varType: "int", description: "Fixes the range of the parameters p and q of the ARIMA model. A higher " +
            "number results on exponentially more calculation time, and might no significantly improve the prediction" +
            "results for anomaly detection. It is recommended not to exceed the default value"}
    ]
});

algorithmsInfo.set('adaptiveKNN', {
    name: 'Adaptive Kernel Density Based',
    type: "MultiVariate",
    code: 'adaptiveKNN',
    parameters: [
        {name: "Number of Nearest Neighbors", variable: "k", defaultValue: 10, value: 10, varType: "int",
            description: "Data points considered to compute Kernel Radius."},
        {name: "Overall Smoothing parameter", variable: "c", defaultValue: 0.7, value: 0.7, varType: "float",
            description: "Smoothing parameter, values recommended between 0.5 and 1"},
        {name: "Sampling parameters", variable: "sp", defaultValue: 1, value: 1, varType: "float",
            description: "Represents the fraction of the data sampled to be used in the training sample, in big " +
            "dataSets this parameter is recommended to be set to small values. It must be between 0 and 1"}
    ]
});

algorithmsInfo.set('iForest', {
    name: 'Isolation Forest',
    type: "MultiVariate",
    code: 'iForest',
    parameters: [
        {name: "Number of Trees", variable: "t", defaultValue: 20, value: 20, varType: "int",
            description: "Number of trees computed to set the isolation forest"},
        {name: "Sampling parameter", variable: "sp", defaultValue: 0.1, value: 0.1, varType: "float",
            description: "Represents the fraction of the data sampled to be used in each tree, it is recommended " +
            "to be set to a value that make the number of data available for each tree around 150 samples. " +
            "It must be between 0 and 1"}
    ]
});

// Defines all the implemented questions parameters
// The parameters must be asked by Daphne in the
// Or must be introduced directly on the question:
// ... fixing max lag analyzed in 2000/ using 2000 as max lag analyzed
let questionsInfo = new Map();

questionsInfo.set('CheckSeasonality', {
    name: 'Is there seasonality on the selected variable?',
    parameters: [
        {name: "Max lag analyzed", variable:"n", defaultValue: 100, value: 100, varType:"int"}
    ]
});

// Defines the Name given to the anomaly score name from the algorithms output
let anomalyScoreName = "anomalyScore";

const state = {

    anomalyProblemData: [],
    anomalyVariables: [],
    anomalyVariablesCorrelation: [],
    allDetectedAnomalies: [],
    variableChosen: [],
    isRunning: false,

    // Algorithms for which an API was implemented
    methodsAPI: ["ADWindowedStats"],
    methodsWS: ["SARIMAX_AD", "adaptiveKNN", "iForest"],

    // Variables related to the AD Algorithm
    algorithmParameters: [],
    numberAnomalies: 0, // Todo check how to compute this
    detectedOneVarAnomalies:{},
    multiVariateAnomalyScores:{},
    websocketAD: null,

    oneVarAlgorithmSelected: 'none',
    multiVarAlgorithmSelected: 'none',

    // Variables related to the question asked
    dummyDrawAnomalies: false, // Switch to watch the changes of the detectedOneVarAnomalies
    questionParameters:[],
    writtenResponse:[]  // Contains the response of the questions organized in three points(intro, bulletpoints, postdata) \\ todo change this to allow multiple object of these kind on the written response
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

    getAnomalyVariables(state) {
        return state.anomalyVariables;
    },

    getVariableChosen(state) {
        return state.variableChosen;
    },

    getDetectedOneVarAnomalies(state){
        return state.detectedOneVarAnomalies;
    },

    getNumberAnomalies(state){
        return state.numberAnomalies
    },

    getAlgorithmName: (state) => (Algorithm) => {
        return algorithmsInfo.get(Algorithm).name
    },

    isAlgorithmMultiVariate: (state) => (Algorithm) => {
        return algorithmsInfo.get(Algorithm).type === "MultiVariate"
    },

    getAlgorithmParameters: (state) => (Algorithm) => {
        return algorithmsInfo.get(Algorithm).parameters;
    },

    getQuestionParameters: (state) => (Question) => {
        return questionsInfo.get(Question).parameters;
    },

    getDummyDrawAnomalies(state){
        return state.dummyDrawAnomalies;
    },

    getMultiVariateAnomalyScores(state){
        return state.multiVariateAnomalyScores;
    },

    getWrittenResponse(state){
        return state.writtenResponse;
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
                console.log("Running Anomaly detection method (" + Method +") from API");
                let dataResponse = await fetch(
                    'api/anomaly/' + Method,
                    {
                        method: 'POST',
                        body: JSON.stringify(reqData),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        }),
                        credentials: 'same-origin'
                    }
                );

                if (dataResponse.ok) {
                    let data = await dataResponse.json();
                    if (data.includes('error')) { // Todo try if errors are working properly
                        console.error('Internal Algorithm error: ' + data['error']);
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
                                'variable': getters.getVariableChosen,
                                'algorithm': Method,
                                'anomalies': JSON.parse(data)
                            });
                        }
                    }
                }
                else {
                    console.error('Error accessing the data');
                }

            }
            else if (state.methodsWS.includes(Method)){

                console.log("Running Anomaly detection method (" + Method + ") from WS");

                const websocketPromise = new Promise((resolve, reject) => {

                    // Websocket connection
                    let websocket = new WebSocket(((window.location.protocol === 'https:') ? 'wss://' : 'ws://')
                        + window.location.host + '/api/anomaly/' + Method);

                    websocket.onopen = function() {
                        console.log('Web Socket Conenction Made');
                        resolve();
                    };

                    websocket.onmessage = function (message) {
                        console.log(message);
                        let data = JSON.parse(message.data);
                        if (data.includes('error')) {
                            console.error('Internal Algorithm error: ' + data['error']);
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
                                    'variable': getters.getVariableChosen,
                                    'algorithm': Method,
                                    'anomalies': JSON.parse(data)
                                });
                            }
                            commit("switchDrawAnomalies");
                        }
                    };
                    store.commit('setWebsocketAD', websocket);

                });
                // On the answer of the websocket
                websocketPromise.then(() => {
                    state.websocketAD.send(JSON.stringify(reqData));
                });
            }
        }
        catch (e) {
            console.error("Networking error: ", e)
        }
    },

    async loadAnomalyData({commit}, fileName) {
        console.log("importing anomaly data...");

        try {
            let reqData = new FormData();
            reqData.append('filename', fileName);
            let dataResponse = await fetch (
                '/api/anomaly/import-data',
                {
                    method: 'POST',
                    body: reqData,
                    credentials: 'same-origin'
                }
            );

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('updateAnomalyData', data['data']);  // Todo simplify by declaring it in a function
                commit('updateAnomalyVariables', data['variables']);
                commit('updateAnomalyVariablesCorrelation', data['correlation']);
                commit('initializeAlgorithmsResultVectors');
            }
            else{
                console.error('Error accessing the data');
            }
        }
        catch (e) {
            console.error('Networking error: ', e);

        }
    },

    async loadAnomalyDataFromFile({commit}, file) {
        console.log("loading anomaly data...");

        try {
            let reqData = new FormData();
            reqData.append('file', file);
            let dataResponse = await fetch (
                '/api/anomaly/read-data',
                {
                    method: 'POST',
                    body: reqData,
                    credentials: 'same-origin'
                }
            );

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('updateAnomalyData', data['data']);
                commit('updateAnomalyVariables', data['variables']);
                commit('updateAnomalyVariablesCorrelation', data['correlation']);
                commit('initializeAlgorithmsResultVectors');
            }
            else{
                console.error('Error accessing the data');
            }
        }
        catch (e) {
            console.error('Networking error: ', e);

        }
    },

    async answerAnomalyQuestion({commit, getters, state}, questionCode) {
        try{
            // commit("updateIsRunning", true); // Todo give the user feedback on the analysis execution
            // Adds the datax
            let reqData = {data: JSON.stringify(getters.getAnomalyProblemData)};

            // Adds the Variable we are focusing on
            reqData['variable'] = getters.getVariableChosen;

            // Add the parameters to the request
            state.questionParameters.forEach((parameter) => {
                if (parameter.varType === "int") {
                    reqData[parameter.variable] = parseInt(parameter.value);
                }
                else if (parameter.varType === "float"){
                    reqData[parameter.variable] = parseFloat(parameter.value);
                }
            });

            console.log("Resolving Request to " + questionCode + " question");
            let dataResponse = await fetch(
                'api/anomaly/analysis/' + questionCode,
                {
                    method: 'POST',
                    body: JSON.stringify(reqData),
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    }),
                    credentials: 'same-origin'
                }
            );

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                console.log(data);
                if (data.hasOwnProperty('error')) {
                    console.error('Internal Algorithm error: ' + data['error']);
                    // TODO: Implement this to show it on the web
                }
                else {
                    // commit("updateIsRunning", false);
                    // Commits the response to be shown in Daphne interface
                    if(data.hasOwnProperty('writtenResponse')){
                        commit("updateWrittenResponse", data['writtenResponse']);
                    }
                    // Todo do the same to responses related with setting a threshold
                }
            }
            else {
                console.error('Error accessing the data');
            }
        }

        catch (e) {
            console.error("Networking error: ", e);

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

    initializeAlgorithmsResultVectors(state){
        state.anomalyVariables.forEach((variable)=>{
            state.detectedOneVarAnomalies[variable] = {};
        });
        state.multiVariateAnomalyScores['none'] = [];
        algorithmsInfo.forEach((algorithm)=>{
            if(algorithm.type === 'MultiVariate'){
                state.multiVariateAnomalyScores[algorithm.code] = [];
            }
        });
    },

    updateDetectedOneVarAnomalies(state, updateParameters){
        state.detectedOneVarAnomalies[updateParameters.variable][updateParameters.algorithm] = updateParameters.anomalies;
    },

    updateAlgorithmParameters(state, algorithmParameters){
        state.algorithmParameters = algorithmParameters
    },

    updateQuestionParameters(state, questionParameters) {
        state.questionParameters = questionParameters
    },

    updateWrittenResponse(state, writtenResponse) {
        state.writtenResponse = writtenResponse;
    },


    updateMultiVariateAnomalyScores(state, updateParameters){
        state.multiVariateAnomalyScores[updateParameters.algorithm] = updateParameters.anomalyScore;
    },

    setWebsocketAD(state,websocket) {
        state.websocketAD = websocket;
    },

    switchDrawAnomalies(state){
        state.dummyDrawAnomalies = ! state.dummyDrawAnomalies;
    },

    updateVariableChosen(state, variable) {
        state.variableChosen = variable;
    },

};

export default {
    state,
    getters,
    actions,
    mutations
}
