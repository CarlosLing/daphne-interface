import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    anomalyDatabase: []
};

const getters = {
    getAnomalyDatabase(state){
        return state.anomalyDatabase;
    }
};

const actions = {
    async loadAnomalyDatabase({commit}, fileName) {
        try {
            let reqData = new FormData();
            reqData.append('filename', fileName);

            let dataResponse = await fetchPost('/api/anomaly/import-database', reqData);

            if (dataResponse.ok){
                let data = await dataResponse.json();
                commit('updateAnomalyDatabase', data);
            }
            else {
                // Display error
            }
        }
        catch (e) {
            // Display error
        }
    },

    async loadAnomalyDatabaseFromFile ({commit}, file) {
        try {
            let reqData = new FormData();
            reqData.append('file', file);

            let dataResponse = await fetchPost('/api/anomaly/import-database-from-file', reqData);

            if (dataResponse.ok){
                let data = await dataResponse.json();
                commit('updateAnomalyDatabase', data);
            }
            else {
                // Display error
            }
        }
        catch (e) {
            // Display error
        }
    }
};

const mutations = {
    updateAnomalyDatabase(state, database){
        state.anomalyDatabase = database;
    }
};


export default {
    state,
    getters,
    actions,
    mutations
}
