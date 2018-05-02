<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-on:change="selectAnomalyQuestion" v-model="selectedQuestion">
                    <option v-for="option in dataSetOptions" v-bind:value="option.value" v-bind:key="option.value">{{option.name}}</option>
                </select>
            </div>
            <button class="button" id="answerAnomalyQuestion-button" @click="answerAnomalyQuestion">Answer</button>
        </div>
        <div class="panel-block functionality">
            <div class="content" v-if="writtenResponse.length > 0">
                <div v-for="Response in writtenResponse">
                    <p>{{Response['introduction']}}</p>
                    <ul v-if="Response['bulletPoints'].length > 0">
                        <li v-for="bulletPoint in Response['bulletPoints']">
                            {{bulletPoint}}
                        </li>
                    </ul>
                    <p v-if="Response['postData'].length > 0">{{Response['postData']}}</p>
                </div>
            </div>
            <div class="content" v-else>
                <p>Not Response Yet</p>
            </div>
        </div>
    </div>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyQuestions",

        data() {
            return {
                // The question parameters are the other inputs of the apis which are not a variable nor the data
                questionParameters: '',
                selectedQuestion: ''

            }
        },


        props: ['name'],

        computed:{
            ...mapGetters({
                getQuestionParameters: 'getQuestionParameters',
                writtenResponse: 'getWrittenResponse'
            }),
            dataSetOptions() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },

        methods:{
            selectAnomalyQuestion(){  // Fixes the question parameters, these might be modified in the functionality or asked by daphne
                this.questionParameters = this.getQuestionParameters(this.selectedQuestion);
            },

            answerAnomalyQuestion(){
                this.$store.commit('updateQuestionParameters', this.questionParameters);
                this.$store.dispatch('answerAnomalyQuestion', this.selectedQuestion);
            }
        }
    }


</script>

<style scoped>

</style>