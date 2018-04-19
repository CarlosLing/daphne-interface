<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-on:change="selectAlgorithm" v-model="selectedList">
                    <option v-for="option in optionsList" v-bind:value="option.value" v-bind:key="option.value">{{ option.name }}</option>
                </select>
            </div>
            <button class="button" id="apply-ADAlgorithm-button" @click="runAlgorithm">Apply Anomaly Detection</button>
        </div>
        <div class="panel-block functionality">
            <div class="content">
                <ul v-if="algorithmsParameters.length">
                    <li v-for="parameter in algorithmsParameters">
                        {{parameter.description}}
                        <input v-model="parameter.value" placeholder="Introduce the Parameter Value">
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
                selectedList: '',
                algorithmsParameters: [],
                test: ""
            }
        },
        props: ['name'],
        computed: {
            ...mapGetters({
                getAlgorithmName: "getAlgorithmName",
                getAlgorithmParameters: "getAlgorithmParameters"
            }),
            optionsList() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },
        methods: {
            selectAlgorithm() {
                this.algorithmsParameters = this.getAlgorithmParameters(this.selectedList)
            },
            runAlgorithm(){
                this.$store.commit('updateAlgorithmParameters', this.algorithmsParameters)
                this.$store.dispatch('detectAnomalies', this.selectedList)
                this.$store.commit('updateChosenAlgorithm', this.getAlgorithmName(this.selectedList))
                //this.$store.dispatch('detectAnomalies', this.selectedList, this.algorithmsParameters.JSON());
            }
        }
    }
</script>

<style scoped>

</style>