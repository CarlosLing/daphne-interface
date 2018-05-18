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
        {name: 'Maximum # steps to consider influence between anomalies', variable:"radius", defaultValue: 3, value: 3, varType:"int"}
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
        {name: "Show Spearman's correlation", variable:'Spearman', defaultValue: false, value: false},
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

questionsInfo['DiagnoseAnomalies'] = {
    name: 'Diagnose the anomalies present on the selected data',
    parameters: [],
    parametersOptions: [],
    parametersCheckbox: [
        {name: "Use only the selected data", variable: "useSelectedData", defaultValue: false, value: false}],
    listVariables: false
};

const state = {
    algorithmsInfo: algorithmsInfo,
    questionsInfo: questionsInfo
};

const getters = {
    getAlgorithmName: (state) => (Algorithm) => {
        return state.algorithmsInfo[Algorithm].name
    },

    isAlgorithmMultiVariate: (state) => (Algorithm) => {
        return state.algorithmsInfo[Algorithm].type === "MultiVariate"
    },

    getAlgorithmParameters: (state) => (Algorithm) => {
        return state.algorithmsInfo[Algorithm].parameters;
    },

    getOptionsListAlgorithm (state){
        return state.algorithmsInfo;
    },

    getQuestionList (state){
        return state.questionsInfo;
    },

    getQuestionParameters: (state) => (Question) => {
        return state.questionsInfo[Question].parameters;
    },

    getQuestionParametersOption: (state) => (Question) => {
        return state.questionsInfo[Question].parametersOptions;
    },

    getQuestionParametersCheckbox: (state) => (Question) => {
        return state.questionsInfo[Question].parametersCheckbox;
    },

    getQuestionListVariables: (state) => (Question) => {
        return state.questionsInfo[Question].listVariables ;
    }
};

export default {
    state,
    getters
}
