
let algorithmsInfo= new Map();

algorithmsInfo.set('ADWindowedStats', {
    name: "Windowed Statistic Method",
    parameters:[
        {description: "Window Parameter", variable: "w", defaultValue: 100, value: 100, varType:"int"},
        {description: "Threshold in STD", variable: "tstd", defaultValue: 3, value: 3, varType:"float"}]
});


const state = {
    anomalyProblemData: [],
    anomalyVariables: [],
    allDetectedAnomalies: [],
    // Algorithms for which an API was implemented
    methodsAPI: ["ADWindowedStats"],

    algorithmParameters: [],
    chosenAlgorithm: "None",
    currentDetectedAnomalies: []

};

const getters = {
    getAnomalyProblemData(state) {
        return state.anomalyProblemData;
    },

    getAnomalyVariables(state) {
        return state.anomalyVariables;
    },

    getMethodsAPI(state){
        return state.methodsAPI;
    },

    getCurrentDetectedAnomalies(state) {
        return state.currentDetectedAnomalies
    },

    getNumberAnomalies(state){
        return state.currentDetectedAnomalies.length;
    },

    getChosenAlgorithm(state){
        return state.chosenAlgorithm
    },

    getAlgorithmName: (state) => (Algorithm) => {
        return algorithmsInfo.get(Algorithm).name
    },

    getAlgorithmParameters: (state) => (Algorithm) => {
        return algorithmsInfo.get(Algorithm).parameters;
    }
};

const actions = {

    async detectAnomalies({state, getters, commit}, Method) { //TODO Implement a Functionality to this
        console.log("Running Anomaly detection algorithm")

        try {
            let reqData = new FormData();
            reqData.append('data', JSON.stringify(getters.getAnomalyProblemData));
            if (state.methodsAPI.includes(Method)) {
                console.log("Running Anomaly detection method (" + Method +") from API")
                let dataResponse = await fetch(
                    'api/anomaly/' + Method,
                    {
                        method: 'POST',
                        body: reqData,
                        credentials: 'same-origin'
                    }
                );

                if (dataResponse.ok) {
                    let data = await dataResponse.json();
                    if (data.includes('error')) {
                        console.error('Internal Algorithm error: ' + data['error']);
                        // TODO: Implement this to show it on the web
                    }
                    else {
                        commit("addDetectedAnomalies", data)
                        commit("updateCurrentDetectedAnomalies", data)
                    }
                }
                else {
                    console.error('Error accessing the data');
                }

            }
        }
        catch (e) {
            console.log("Networking error: ", e)
        }

    },

    async loadAnomalyData({state, commit}, fileName) {
        console.log("importing anomaly data...");

        try {
            let reqData = new FormData();
            reqData.append('filename', fileName);
            state.algorithmParameters.forEach((parameter) => {
                if (parameter.varType === "int") {
                    reqData.append(parameter.variable, "" + parseInt(parameter.value))
                }
                else if (parameter.varType === "float"){
                    reqData.append(parameter.variable, "" + parseFloat(parameter.value))
                }
            });
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
                commit('updateAnomalyData', data['data']);
                commit('updateAnomalyVariables', data['variables']);
            }
            else{
                console.error('Error accessing the data');
            }
        }
        catch (e) {
            console.error('Networking error: ', e);

        }
    }
};

const mutations = {
    updateAnomalyData(state, anomalyData) {
        state.anomalyProblemData = anomalyData
    },

    updateAnomalyVariables(state, anomalyVariables) {
        state.anomalyVariables = anomalyVariables
    },

    addDetectedAnomalies(state, newAnomalies) {
        state.allDetectedAnomalies.push(JSON.parse(newAnomalies))
    },

    updateCurrentDetectedAnomalies(state, anomalies) {
        state.currentDetectedAnomalies = JSON.parse(anomalies)
    },

    updateAlgorithmParameters(state, algorithmParameters){
        state.algorithmParameters = algorithmParameters
    },

    updateChosenAlgorithm(state, newChosenAlgorithm) {
        state.chosenAlgorithm = newChosenAlgorithm
    }

};

export default {
    state,
    getters,
    actions,
    mutations
}
