<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block"><b>Select a Sample DataSet...</b></div>
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-model="selectedDataSet">
                    <option v-for="option in dataSetOptions" v-bind:value="option.value" v-bind:key="option.value">{{ option.name }}</option>
                </select>
            </div>
            <button class="button" id="loadData-button" @click="loadData">Load</button>
        </div>
        <div class="panel-block"><b>...Or Upload your Data here</b></div>
        <div class="panel-block functionality">
            <!--Todo implement functionality to load data sets-->
            <div class="content">
                <p>Upload your Data by Dragging your .csv file here</p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DataLoader",

        data() {
            return {
                selectedDataSet: '',
            }
        },

        props: ['name'],
        computed:{
            dataSetOptions() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },

        methods:{
            loadData(){
                this.$store.dispatch('loadAnomalyData', this.selectedDataSet)
            }
        }

    }

</script>

<style scoped>

</style>