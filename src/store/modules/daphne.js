// initial state
import * as _ from 'lodash-es';

const state = {
    command: '',
    response: {},
    isLoading: false
};

const initialState = _.cloneDeep(state);

// getters
const getters = {
    getResponse(state) {
        return state.response;
    },
    getIsLoading(state) {
        return state.isLoading;
    }
};

// actions
const actions = {
    async executeCommand({ state, commit }) {
        commit('setIsLoading', true);
        try {
            let reqData = new FormData();
            reqData.append('command', state.command);
            let dataResponse = await fetch(
                '/api/daphne/command',
                {
                    method: 'POST',
                    body: reqData,
                    credentials: 'same-origin'
                }
            );

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('setResponse', data['response']);
            }
            else {
                console.error('Error processing the command.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
        commit('setIsLoading', false);
    }
};

// mutations
const mutations = {
    setCommand(state, command) {
        state.command = command;
    },
    setResponse(state, response) {
        state.response = response;
    },
    setIsLoading(state, isLoading) {
        state.isLoading = isLoading;
    },
    resetDaphne(state) {
        state = Object.assign(state, _.cloneDeep(initialState));
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}
