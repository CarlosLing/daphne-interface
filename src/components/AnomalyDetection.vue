<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block">
            <div><b>Select Variable:</b></div>
            <div class="select is-fullwidth">
                <select v-on:change="selectVariable" v-model="selectedVariable">
                    <option v-for="option in variableList" v-bind:value="option"
                            v-bind:key="option" >{{option}}</option>
                </select>
            </div>
        </div>
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-on:change="selectAlgorithm" v-model="selectedAlgorithm">
                    <option v-for="option in algorithmOptions" v-bind:value="option.value" v-bind:key="option.value">{{ option.name }}</option>
                </select>
            </div>
            <button class="button" id="apply-ADAlgorithm-button" @click="runAlgorithm" v-bind:class="{ 'is-loading': isLoading }">Apply Anomaly Detection</button>
        </div>
        <div class="panel-block functionality">
            <div class="content">
                <ul v-if="algorithmsParameters.length">
                    <li v-for="parameter in algorithmsParameters">
                        {{parameter.variable}}:
                        <input v-model="parameter.value" placeholder="Introduce the Parameter Value">
                        <br> <b>{{parameter.name}}</b>: {{parameter.description}}
                    </li>
                </ul>
                <p v-else>Choose one of the available Anomaly Detection  Methods</p>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyDetection",
        data () {
            return {
                selectedVariable: '',
                selectedAlgorithm: '',

                algorithmsParameters: [],
                test: ""
            }
        },
        props: ['name'],
        computed: {
            ...mapGetters({
                isLoading: "getIsRunning",
                getAlgorithmName: "getAlgorithmName",
                getAlgorithmParameters: "getAlgorithmParameters",
                variableList: "getAnomalyVariables"
            }),
            algorithmOptions() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },
        methods: {
            selectAlgorithm() {
                this.algorithmsParameters = this.getAlgorithmParameters(this.selectedAlgorithm)
            },

            selectVariable() {
                this.$store.commit("updateVariableChosen", this.selectedVariable)
            },
            runAlgorithm(){
                this.$store.commit('updateAlgorithmParameters', this.algorithmsParameters);
                this.$store.commit('updateNameChosenAlgorithm', this.getAlgorithmName(this.selectedAlgorithm));
                this.$store.dispatch('detectAnomalies', this.selectedAlgorithm);
            }
        }
    }
</script>

<style scoped>

</style>