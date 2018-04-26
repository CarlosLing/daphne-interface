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
    </div>
</template>

<script>
    export default {
        name: "DataLoader",

        data() {
            return {
                selectedDataSet: '',
                fileInput: '',
                options: {
                    url: '/data'
                }
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
            },
            onFileChange() {
                let  fileField = document.querySelector("input[type='file']");

                this.$store.dispatch('loadAnomalyDataFromFile', fileField.files[0]);

                // let files = e.target.files || e.dataTransfer.files;
                // console.log(files[0]);
                // if (!files.length)
                //     return;
                // this.createInput(files[0]);
            },

            createInput(file) {
                let reader = new FileReader();
                let vm = this;
                reader.onload = (e) => {

                    vm.fileinput = reader.result;
                };
                reader.readAsText(file);

                console.log(this.fileinput);
            }
        }

    }

</script>

<style scoped>

</style>