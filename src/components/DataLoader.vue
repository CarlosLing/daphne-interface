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
            <p>(Remember to include a column called "timestamp" which contains the time information)</p>
            <div class="content">
                <div class="file is-large">
                    <label class="file-label">
                        <input class="file-input" type="file" name="resume" @change="onFileChange">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                                Upload your .csv file here
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
        <div class="panel-block"><b>Loaded data: </b>
            <div v-if="!isDataLoaded">No Data is loaded yet</div>
            <div v-else>
                {{loadedData}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DataLoader",

        data() {
            return {
                isDataLoaded: false,
                selectedDataSet: '',
                loadedData: ''
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
                this.$store.dispatch('loadAnomalyData', this.selectedDataSet);
                this.loadedData = this.selectedDataSet + "(Sample data)"; // todo this logic must be into the store
                this.isDataLoaded = true;
            },
            onFileChange() {
                let  fileField = document.querySelector("input[type='file']");
                this.$store.dispatch('loadAnomalyDataFromFile', fileField.files[0]);
                this.isDataLoaded = true;
                this.loadedData = fileField.files[0]['name'] + "(Uploaded)";
            }
        }
    }

</script>

<style scoped>

</style>