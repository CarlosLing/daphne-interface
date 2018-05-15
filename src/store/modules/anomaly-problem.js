import store from "../index";

// Defines all algorithms Parameters and characteristics
let algorithmsInfo = {};

// Note that new algorithms must be included in the Option list of Anomaly Detection in './functionality-list.js'
algorithmsInfo['none'] = {
    name: "No Algorithm has been selected",
    value: 'none'
};

algorithmsInfo['ADWindowedStats'] = {
    name: "Windowed Statistic Method",
    type: "UniVariate",
    value: 'ADWindowedStats',
    parameters:[
        {name: "Window Parameter", variable: "w", defaultValue: 100, value: 100, varType:"int",
            description: "Fixes the number of observations before the data to be analyzed. \nA higher number implies the anomaly detected is an outlier in a more general context, while a smaller number will imply that the anomaly is local"},
        {name: "Threshold in STD", variable: "tstd", defaultValue: 3, value: 3, varType:"float",
            description: "Fixes the degree of confidence with which we classify the data as an anomaly. A higher threshold means we are detecting extremer outliers"}],
    characteristics: [
        {description: "Target: the main target of this method is the detection of values which represent an outlier of the w previous methods"},
        {description: "Time consuming: The method is lightweight, for each data point a "}

    ]
};
// Note that Default value is never used, although it migh be interesting to use it if the below to do is implemented
// TODO at some point might eb interesting to implement a restore default setting button
algorithmsInfo['SARIMAX_AD'] = {
    name: "Seasonal ARIMA + Exogenous Variables",
    type: "UniVariate",
    value: 'SARIMAX_AD',
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
};

algorithmsInfo['adaptiveKNN'] = {
    name: 'Adaptive Kernel Density Based',
    type: "MultiVariate",
    value: 'adaptiveKNN',
    parameters: [
        {name: "Number of Nearest Neighbors", variable: "k", defaultValue: 10, value: 10, varType: "int",
            description: "Data points considered to compute Kernel Radius."},
        {name: "Overall Smoothing parameter", variable: "c", defaultValue: 0.7, value: 0.7, varType: "float",
            description: "Smoothing parameter, values recommended between 0.5 and 1"},
        {name: "Sampling parameters", variable: "sp", defaultValue: 1, value: 1, varType: "float",
            description: "Represents the fraction of the data sampled to be used in the training sample, in big " +
            "dataSets this parameter is recommended to be set to small values. It must be between 0 and 1"}
    ]
};

algorithmsInfo['iForest'] = {
    name: 'Isolation Forest',
    type: "MultiVariate",
    value: 'iForest',
    parameters: [
        {name: "Number of Trees", variable: "t", defaultValue: 20, value: 20, varType: "int",
            description: "Number of trees computed to set the isolation forest"},
        {name: "Sampling parameter", variable: "sp", defaultValue: 0.1, value: 0.1, varType: "float",
            description: "Represents the fraction of the data sampled to be used in each tree, it is recommended " +
            "to be set to a value that make the number of data available for each tree around 150 samples. " +
            "It must be between 0 and 1"}
    ]
};

// Defines all the implemented questions parameters
// The parameters must be asked by Daphne in the
// Or must be introduced directly on the question:
// ... fixing max lag analyzed in 2000/ using 2000 as max lag analyzed
// Todo The questions might be separated into different files for a better understanding Separate Algorithm and Question logic
let questionsInfo = {};

questionsInfo['CheckSeasonality'] = {
    name: 'Is there seasonality on the selected variable?',
    parameters: [
        {name: "Max lag analyzed", variable:"n", defaultValue: 100, value: 100, varType:"int"}
    ],
    parametersOptions: [], parametersCheckbox: [], listVariables: false
};

questionsInfo['detectThreshold'] = {
    name: 'Set the Threshold of the Anomaly Score from the selected methods to ...(0.9 as default) and show the anomalies detected',
    parameters: [
        {name: "threshold", variable:"threshold", defaultValue: 0.9, value: 0.9, varType:"float"}
    ],
    parametersOptions: [],
    parametersCheckbox: [
        {name: "Use only the selected data", variable: "useSelectedData", defaultValue: false, value: false}
    ],
    listVariables: false
};

questionsInfo['detectNumber'] = {
    name: 'Classify the ...(50 as default) most anomalous points as anomalies attending to the selected method Score',
    parameters: [
        {name: "Number of Anomalies", variable:"n", defaultValue: 50, value: 50, varType:"int"}
    ],
    parametersOptions: [],
    parametersCheckbox: [
        {name: "Use only the selected data", variable: "useSelectedData", defaultValue: false, value: false}],
    listVariables: false
};

questionsInfo['MethodsAgreement'] = {
    name: 'Is there agreement with ...(Method 1) and ...(Method 2), in the variable selected (if UniVariate)?',
    parameters: [
        {name: 'Relation Radius', variable:"radius", defaultValue: 3, value: 3, varType:"int"}
    ],
    parametersOptions: [
        {name: "Method 1", variable:"selectedAlgorithm", value: '', subIndex: 'One', type: "Algorithm"},
        {name: "Method 2", variable:"selectedAlgorithm", value: '', subIndex: 'Two', type: "Algorithm"}
    ],
    parametersCheckbox: [
        {name: "Use only the selected data", variable: "useSelectedData", defaultValue: false, value: false}],
    listVariables: false
};

questionsInfo['Correlations'] = {
    name: 'How correlated are the problem variables/ is the variable ...(selected variable)?',
    parameters: [
        {name: 'Highest correlations to Show', variable:"n", defaultValue: 5, value: 5, varType:"int"}
    ],
    parametersOptions: [],
    parametersCheckbox: [
        {name: 'Analyze all the variables', variable:'analyzeAllVariables', defaultValue: true, value: true}
    ],
    listVariables: false
};

questionsInfo['CountAnomalies'] = {
    name: 'Which are the (n) variables with the higher number of anomalies in the selected region?',
    parameters: [
        {name: 'Number of variables shown', variable:"n", defaultValue: 3, value: 3, varType:"int"}
    ],
    parametersOptions: [],
    parametersCheckbox: [
        {name: 'Analyze all the series', variable:'analyzeAllSeries', defaultValue: false, value: false}
    ],
    listVariables: false
};

questionsInfo['RemoveVariables'] = {
    name: 'Remove the selected variables from the analysis',
    parameters: [],
    parametersOptions: [],
    parametersCheckbox: [],
    listVariables: true
};

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

    getQuestionList (){
        return questionsInfo;
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

    getAlgorithmName: () => (Algorithm) => {
        return algorithmsInfo[Algorithm].name
    },

    isAlgorithmMultiVariate: () => (Algorithm) => {
        return algorithmsInfo[Algorithm].type === "MultiVariate"
    },

    getAlgorithmParameters: () => (Algorithm) => {
        return algorithmsInfo[Algorithm].parameters;
    },

    getQuestionParameters: () => (Question) => {
        return questionsInfo[Question].parameters;
    },

    getQuestionParametersOption: () => (Question) => {
        return questionsInfo[Question].parametersOptions;
    },

    getQuestionParametersCheckbox: () => (Question) => {
        return questionsInfo[Question].parametersCheckbox;
    },

    getQuestionListVariables: () => (Question) => {
        return questionsInfo[Question].listVariables ;
    },

    getOptionsListAlgorithm (){
        return algorithmsInfo;
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
                                'variable': reqData['variable'],
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
            // Adds the data
            let reqData = {
                data: JSON.stringify(getters.getAnomalyProblemData),
                variable: getters.getVariableChosen,
                selectedMultiVarAlgorithm: getters.getMultiVarAlgorithmSelected,
                anomalyScore: getters.getMultiVariateAnomalyScores,
                detectedOneVarAnomalies: getters.getDetectedOneVarAnomalies,
                detectedMultiVarAnomalies: getters.getDetectedMultiVarAnomalies,
                correlation: getters.getAnomalyVariablesCorrelation,
                selectedData: getters.getSelectedData,
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
                    reqData["typeAlgorithm" + parameter.subIndex] = algorithmsInfo[parameter.value].type;
                }
            });

            state.questionParametersCheckbox.forEach((parameter) => {
                reqData[parameter.variable] = parameter.value;
            });

            // Resolve the request
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

            // Process response
            if (dataResponse.ok) {
                let data = await dataResponse.json();
                if (data.hasOwnProperty('error')) {
                    console.error('Internal Algorithm error: ' + data['error']);
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
                        commit('initializeAlgorithmsResultVectors');
                    }
                    commit('switchDrawAnomalies');
                    commit('updateQuestionExecuted', true);
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
        state.detectedOneVarAnomalies = {};
        state.anomalyVariables.forEach((variable)=>{
            state.detectedOneVarAnomalies[variable] = {};
            for (var algorithm in algorithmsInfo){
                if(algorithmsInfo[algorithm].type === 'UniVariate' || algorithm === 'none'){
                    state.detectedOneVarAnomalies[variable][algorithmsInfo[algorithm].value] = [];
                }
            }
        });
        state.multiVariateAnomalyScores = {};
        state.detectedMultiVarAnomalies = {};
        state.multiVariateAnomalyScores['none'] = [];
        for (var algorithm in algorithmsInfo){
            if(algorithmsInfo[algorithm].type === 'MultiVariate' || algorithm === 'none'){
                state.multiVariateAnomalyScores[algorithmsInfo[algorithm].value] = [];
                state.detectedMultiVarAnomalies[algorithmsInfo[algorithm].value] = [];
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
