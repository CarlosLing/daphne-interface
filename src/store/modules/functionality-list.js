import * as _ from 'lodash-es';

let functionalityTypes = new Map();

// Anomaly Code
functionalityTypes.set('AnomalyDetection', {
    title: 'Anomaly Detection',
    component: 'AnomalyDetection',
    class: 'anomaly-detection',
    minSize: 'two-thirds',
    maxRepeat: 1,
    optionsList: [
        // Here we will be listing all the methods implemented
        {name: "", value: ""},
        {name: "Windowed Statistic Method", value: "ADWindowedStats"}
    ]});

functionalityTypes.set('DaphneAnswer', { title: 'Answers', component: 'DaphneAnswer', class: 'answers', minSize: 'one-third', maxRepeat: 1});
functionalityTypes.set('DesignBuilder', { title: 'Design Builder', component: 'DesignBuilder', class: 'design-builder', minSize: 'two-thirds', maxRepeat: 1});
functionalityTypes.set('DataMining', { title: 'Data Mining', component: 'DataMining', class: 'data-mining', minSize: 'one-third', maxRepeat: 1});
functionalityTypes.set('EOSSFilter', { title: 'Filter', component: 'EOSSFilter', class: 'filter', minSize: 'one-third', maxRepeat: 1});
functionalityTypes.set('FeatureApplication', { title: 'Feature Application', component: 'FeatureApplication', class: 'feature-application', minSize: 'one-third', maxRepeat: 1});
functionalityTypes.set('OrbitInstrInfo', {
    title: 'Orbits and Instruments Information',
    component: 'Cheatsheet',
    class: 'orbit-instr-info',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "Orbits Information", value: "orb_info"},
        {name: "Instruments Information", value: "instr_info"}
    ]});
functionalityTypes.set('AvailableCommands', {
    title: 'Available Commands',
    component: 'Cheatsheet',
    class: 'available-commands',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "General", value: "general"},
        {name: "iFEED", value: "ifeed"},
        {name: "Analyst", value: "analyst"},
        {name: "Critic", value: "critic"},
        {name: "Historian", value: "historian"}
    ]});
functionalityTypes.set('CommandsInformation', {
    title: 'Commands Information',
    component: 'Cheatsheet',
    class: 'commands-information',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "Analyst Instruments", value: "analyst_instruments"},
        {name: "Analyst Instrument Parameters", value: "analyst_instrument_parameters"},
        {name: "Analyst Measurements", value: "analyst_measurements"},
        {name: "Analyst Stakeholders", value: "analyst_stakeholders"},
        {name: "Analyst Objectives", value: "objectives"},
        {name: "Historical Measurements", value: "measurements"},
        {name: "Historical Missions", value: "missions"},
        {name: "Historical Technologies", value: "technologies"},
        {name: "Historical Space Agencies", value: "space_agencies"}
    ]});


let newFunctionalityId = 0;

// initial state
// shape: [{ id, quantity }]
const state = {
    availableFunctionalities: [
        { name: 'DaphneAnswer', title: 'Answers', icon: 'fa-comments' },
        { name: 'DesignBuilder', title: 'Design Builder', icon: 'fa-search' },
        { name: 'AnomalyDetection', title: 'Anomaly Detection', icon: 'fa-chart-bar' },
        { name: 'DataMining', title: 'Data Mining', icon: 'fa-chart-bar' },
        { name: 'EOSSFilter', title: 'Filter', icon: 'fa-filter' },
        { name: 'FeatureApplication', title: 'Feature Application', icon: 'fa-sitemap' },
        { name: 'OrbitInstrInfo', title: 'Orbits and Instruments Information', icon: 'fa-book' },
        { name: 'AvailableCommands', title: 'Available Commands', icon: 'fa-book' },
        { name: 'CommandsInformation', title: 'Commands Information', icon: 'fa-book' }
    ],
    functionalities: [],
    functionalityCount: {
        'DaphneAnswer': 0,
        'DesignBuilder': 0,
        'AnomalyDetection': 0,
        'DataMining': 0,
        'EOSSFilter': 0,
        'FeatureApplication': 0,
        'OrbitInstrInfo': 0,
        'AvailableCommands': 0,
        'CommandsInformation': 0
    }
};

const initialState = _.cloneDeep(state);

// getters
const getters = {
    getOptionsList: (state) => (name) => {
        return functionalityTypes.get(name).optionsList;
    }
};

// actions
const actions = {
};

// mutations
const mutations = {
    addFunctionality(state, functionality) {
        let funcInfo = functionalityTypes.get(functionality);

        if (state.functionalityCount[functionality] < funcInfo.maxRepeat) {
            // Add to columns and to the array
            state.functionalities.push({
                name: functionality,
                component: funcInfo.component,
                title: funcInfo.title,
                funcClass: funcInfo.class,
                initialSize: funcInfo.minSize,
                id: newFunctionalityId++
            });
            state.functionalityCount[functionality]++;
        }
    },
    closeFunctionality(state, funcId) {
        let funcIndex = state.functionalities.findIndex((elem) => elem.id === funcId);
        let funcName = state.functionalities[funcIndex].name;
        state.functionalities.splice(funcIndex, 1);
        state.functionalityCount[funcName]--;
    },
    resetFunctionalityList(state) {
        state = Object.assign(state, _.cloneDeep(initialState));
    },
    restoreFunctionalityList(state, recoveredState) {
        Object.keys(recoveredState).forEach((key) => {
            state[key] = recoveredState[key];
        });
    }

};

export default {
    state,
    getters,
    actions,
    mutations
}
