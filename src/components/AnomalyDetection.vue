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
            <div class="content" v-if="oneVarAlgorithm">
                <input type="checkbox" v-model="applyToAllVariables"> <b>Apply to all Variables</b>
            </div>
            <div class="content" v-if="algorithmsParameters.length">
                <p><u><b>Model Parameters:</b></u></p>
                <ul>
                    <li v-for="parameter in algorithmsParameters">
                        {{parameter.variable}}:
                        <input v-model="parameter.value" placeholder="Introduce the Parameter Value">
                        <br> <b>{{parameter.name}}</b>: {{parameter.description}}
                    </li>
                </ul>
            </div>
            <div class="content" v-else><p>Choose one of the available Anomaly Detection  Methods</p></div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import * as _ from "lodash-es";

    export default {
        name: "AnomalyDetection",
        data () {
            return {
                selectedVariable: '',
                selectedAlgorithm: '',
                oneVarAlgorithm: false,
                applyToAllVariables: false,

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
                variableList: "getAnomalyVariables",
                getDetectedOneVarAnomalies: "getDetectedOneVarAnomalies",
                isAlgorithmMultiVariate: 'isAlgorithmMultiVariate'
            }),
            algorithmOptions() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },
        methods: {
            selectAlgorithm() {
                this.algorithmsParameters = JSON.parse(JSON.stringify(this.getAlgorithmParameters(this.selectedAlgorithm)));
                if (this.isAlgorithmMultiVariate(this.selectedAlgorithm)){
                    this.$store.commit('updateMultiVarAlgorithmSelected', this.selectedAlgorithm);
                    this.oneVarAlgorithm = false;
                }else{
                    this.$store.commit('updateOneVarAlgorithmSelected', this.selectedAlgorithm);
                    this.oneVarAlgorithm = true;
                }
            },
            selectVariable() {
                this.$store.commit("updateVariableChosen", this.selectedVariable);
            },
            runAlgorithm(){
                this.$store.commit('updateAlgorithmParameters', this.algorithmsParameters);
                this.algorithmsParameters = JSON.parse(JSON.stringify(this.getAlgorithmParameters(this.selectedAlgorithm)));
                if (this.applyToAllVariables && this.oneVarAlgorithm){
                    this.variableList.forEach((variable) => {
                        this.$store.commit("updateVariableChosen", variable);
                        this.$store.dispatch('detectAnomalies', this.selectedAlgorithm).then(()=>{this.$store.commit('switchDrawAnomalies')});
                    });
                    this.$store.commit("updateVariableChosen", this.selectedVariable);
                } else {
                    this.$store.dispatch('detectAnomalies', this.selectedAlgorithm).then(()=>{this.$store.commit('switchDrawAnomalies')});
                }

            }
        },

        watch: {
            selectedAlgorithm: function(val, oldVal) {
                this.$store.commit('updateNumberAnomalies');
            },
            selectedVariable: function(val, oldVal) {
                this.$store.commit('updateNumberAnomalies');
            },
            isLoading: function(val, oldVal) {
                this.$store.commit('updateNumberAnomalies');
            }
        }
    }
</script>

<style scoped>

</style>