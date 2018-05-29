<template>
    <div class="column">
        <section class="panel">
            <p class="panel-heading">
                UniVariate Algorithm: {{getAlgorithmName(oneVarAlgorithmSelected)}} |
                Anomalies detected: {{numberAnomaliesUni}} |.|
                MultiVariate Algorithm: {{getAlgorithmName(multiVarAlgorithmSelected)}} |
                Anomalies detected: {{numberAnomaliesMulti}}
            </p>
            <div>
                <div class="tabs is centered" id="plot-tabs">
                    <ul>
                        <li id="tab_oneVariable" v-on:click="selectTabOption('oneVariable')"
                            v-bind:class="{'is-active': (activePlotTab==='oneVariable')}">
                            <a><span>UniVariate</span></a>
                        </li>
                        <li id="tab_multiVariable" v-on:click="selectTabOption('multiVariable')"
                            v-bind:class="{'is-active': (activePlotTab==='multiVariable')}">
                            <a><span>MultiVariate</span></a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="panel-block" id="main-plot-block">
                <div id="main-plot"></div>
                <div id="selections-block">
                    <div class="card" id="interaction_modes">
                        <header class="card-header">
                            <p class="card-header-title">
                                Mouse Selection
                            </p>
                        </header>
                        <div class="card-content control is-small">
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Zoom/Pan: This option allows zooming/panning on the scatter plot</span>-->
                                <label class="radio">
                                    Zoom/Pan:
                                    <input type="radio" name="mouse-selection" value="zoom-pan" v-model="selectionMode" />
                                </label>
                            </div>
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Drag-select: This option allows selecting designs by dragging over points</span>-->
                                <label class="radio">
                                    Drag-select:
                                    <input type="radio" name="mouse-selection" value="drag-select" v-model="selectionMode" />
                                </label>
                            </div>
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Deselect: This option allows de-selecting designs by dragging over points</span>-->
                                <label class="radio">
                                    Deselect:
                                    <input type="radio" name="mouse-selection" value="de-select" v-model="selectionMode" />
                                </label>
                            </div>
                            <div class="tooltip">
                                <label class="radio">
                                    Overlap both plots
                                    <input type="checkbox" v-model="plotOverlap">
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-content is-small">
                            <div class="field">
                                <p>
                                   Clicked Data Point:
                                </p>
                                <div v-if="clickedData.dataPoint.timestamp">
                                    <p>{{variableChosen}}: {{clickedData.dataPoint[variableChosen]}}</p>
                                    <p>Time: {{clickedData.dataPoint.timestamp}}</p>
                                </div>
                                <div v-else>
                                    <p>No Clicked data</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-content is-small">
                            <div class="field">
                                <p class="control">
                                    <button class="button" id="cancel-selection" v-on:click="cancelSelection">Cancel all selections</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import { mapGetters, mapMutations } from 'vuex';
    import * as _ from 'lodash-es';
    import * as d3 from 'd3';
    import 'd3-selection-multi';

    export default {
        name: 'anomaly-plot',
        data() {
            return {
                plotOverlap:  false,
                mainPlotParams: {
                    margin: {top: 20, right: 60, bottom: 30, left: 60},
                    width: 960,
                    height: 450,
                    scale: 1
                },
                transform: d3.zoomIdentity,
                zoom: {},
                xMap: {},
                yMap: {},
                yAnomalyScoreMap: {},
                context: {}
                // hiddenContext: {}  Hidden context is not necessary here, as is not
            }
        },
        computed: {
            ...mapGetters({
                activePlotTab: 'getActivePlotTab',
                anomalyScoreName: "getAnomalyScoreName",
                anomalyProblemData: 'getAnomalyProblemData',
                variableChosen: 'getVariableChosen',
                colorAnomalyPlot: 'getColorAnomalyPlot',
                activeMouseInterval: 'getActiveMouseInterval',
                hoveredData: 'getHoveredData',
                clickedData: 'getClickedData',
                selectedData: 'getSelectedData',
                preMappedX: 'getPreMappedX',
                getDetectedOneVarAnomalies: 'getDetectedOneVarAnomalies',
                getDetectedMultiVarAnomalies: 'getDetectedMultiVarAnomalies',
                dummyDrawAnomalies: 'getDummyDrawAnomalies',
                getAlgorithmName: 'getAlgorithmName',
                oneVarAlgorithmSelected: 'getOneVarAlgorithmSelected',
                multiVarAlgorithmSelected: 'getMultiVarAlgorithmSelected',
                MultiVariateAnomalyScores: 'getMultiVariateAnomalyScores',


                plotData: 'getPlotData',
                colorMap: 'getColorMap',
                numPoints: 'getNumPoints',
                websocket: 'getWebsocket',
                numberAnomaliesUni: 'getNumberAnomaliesUni',
                numberAnomaliesMulti: 'getNumberAnomaliesMulti'
            }),

            plotWidth() {
                return this.mainPlotParams.width - this.mainPlotParams.margin.right - this.mainPlotParams.margin.left;
            },

            plotHeight() {
                return this.mainPlotParams.height - this.mainPlotParams.margin.top - this.mainPlotParams.margin.bottom;
            },

            numSelectedPoints() {
                return this.selectedArchs.filter(point => point).length;
            },

            selectionMode: {
                get() {
                    return this.$store.state.tradespacePlot.selectionMode;
                },
                set(newSelectionMode) {
                    this.$store.commit('updateSelectionMode', newSelectionMode);
                }
            }
        },

        methods: {
            ...mapMutations([
                'updateClickedArch',
                'updateHoveredData',
                'updateActiveMouseInterval'
            ]),

            selectTabOption(option) {
                this.$store.commit("updateActivePlotTab", option);
                this.updatePlot('timestamp', this.variableChosen);
            },

            resetMainPlot() {
                //Resets the main plot
                d3.select('#main-plot').select('svg').remove();
                d3.select('#main-plot').selectAll('canvas').remove();
                d3.select('#main-plot').style('width', 0 + 'px');
            },

            updatePlot(xIndex, yIndex) {
                this.resetMainPlot();

                // Checks the color in case Plot Overlap is activated:
                this.$store.commit("updatePlotColors");
                this.$store.commit("setOverlapColors", this.plotOverlap);

                // Update width
                this.mainPlotParams.width = document.getElementById('main-plot-block').clientWidth
                    - document.getElementById('selections-block').offsetWidth - 30;
                let margin = this.mainPlotParams.margin;

                // setup x
                let parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
                let xValue = d => parseTime(d[xIndex]); // data -> value
                let xScale = d3.scaleTime().range([0, this.plotWidth]); // value -> display
                xScale.domain(d3.extent(this.anomalyProblemData, xValue));
                this.xMap = d => xScale(xValue(d)); // data -> display
                let xAxis = d3.axisBottom(xScale);
                this.$store.commit('calculatePreMappedX', this.xMap);
                // Creates an inverse of the map function to be used in the selection and feedback problems

                // setup y
                let yValue = d => d[yIndex]; // data -> value
                let yScale = d3.scaleLinear().range([this.plotHeight, 0]); // value -> display
                let yBuffer = Math.max((d3.max(this.anomalyProblemData, yValue) - d3.min(this.anomalyProblemData, yValue)) * 0.05, 0.05);
                yScale.domain([d3.min(this.anomalyProblemData, yValue) - yBuffer, d3.max(this.anomalyProblemData, yValue) + yBuffer]);
                this.yMap = d => yScale(yValue(d)); // data -> display
                let yAxis = d3.axisLeft(yScale);

                // Setup the anomaly score
                let yAnomalyScore = d => d[this.anomalyScoreName]; // data -> value
                let yAnomalyScoreScale = d3.scaleLinear().range([this.plotHeight, 0]); // value -> display
                let yAnomalyScoreBuffer = Math.max((d3.max(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected], yAnomalyScore) - d3.min(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected], yAnomalyScore)) * 0.05, 0.05);
                yAnomalyScoreScale.domain([d3.min(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected], yAnomalyScore) - yAnomalyScoreBuffer, d3.max(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected], yAnomalyScore) + yAnomalyScoreBuffer]);
                this.yAnomalyScoreMap = d => yAnomalyScoreScale(yAnomalyScore(d)); // data -> display
                let yAnomalyScoreAxis = d3.axisRight(yAnomalyScoreScale);

                d3.select('#main-plot')
                    .style('width', this.mainPlotParams.width + 'px')
                    .style('height', this.mainPlotParams.height + 'px');

                this.zoom = d3.zoom()
                    .scaleExtent([0.9, 25])
                    .on('zoom', d => {
                        this.transform = d3.event.transform;
                        gX.call(xAxis.scale(this.transform.rescaleX(xScale)));
                        //gY.call(yAxis.scale(this.transform.rescaleY(yScale)));

                        this.drawAnomalyPlot(this.context);
                    });

                let svg = d3.select('#main-plot')
                    .append('svg')
                    .style('position', 'absolute')
                    .attr('width', this.plotWidth + margin.left + margin.right)
                    .attr('height', this.plotHeight + margin.top + margin.bottom)
                    .call(this.zoom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                let canvas = d3.select('#main-plot')
                    .append('canvas')
                    .style('position', 'absolute')
                    .style('top', margin.top + 'px')
                    .style('left', margin.left + 'px')
                    .attr('width', this.plotWidth)
                    .attr('height', this.plotHeight)
                    .call(this.zoom);

                this.context = canvas.node().getContext('2d');

                // x-axis
                let gX = svg.append('g')
                    .attr('class', 'axis axis-x')
                    .attr('transform', 'translate(0, ' + this.plotHeight + ')')
                    .style('font-size', '16px')
                    .call(xAxis);

                svg.append('text')
                    .attr('transform', 'translate(' + this.plotWidth + ', ' + this.plotHeight + ')')
                    .attr('class', 'label')
                    .attr('y', -6)
                    .style('text-anchor', 'end')
                    .style('font-size', '16px')
                    .text("TimeStamp");

                // Chooses the axis to show depending on the selected plot
                if (this.activePlotTab === "oneVariable" || this.plotOverlap) {
                    // y-axis
                    let gY = svg.append('g')
                        .attr('class', 'y axis')
                        .style('font-size', '16px')
                        .call(yAxis);

                    svg.append('text')
                        .attr('class', 'label')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 6)
                        .attr('dy', '.71em')
                        .style('text-anchor', 'end')
                        .style('font-size', '16px')
                        .text(yIndex);


                    gY.call(yAxis.scale(yScale));
                }

                if (this.activePlotTab === "multiVariable" || this.plotOverlap) {
                    // y-axis for anomaly score
                    let gYAS = svg.append('g')
                        .attr('class', 'y axis')
                        .attr('transform', 'translate(' + this.plotWidth + ', 0)')
                        .style('font-size', '16px')
                        .call(yAnomalyScoreAxis);

                    svg.append('text')
                        .attr('class', 'label')
                        .attr('transform', 'rotate(-90) translate(0,' + (this.plotWidth - 22)  + ')')
                        .attr('y', 6)
                        .attr('dy', '.71em')
                        .style('text-anchor', 'end')
                        .style('font-size', '16px')
                        .text('Anomaly score');

                    gYAS.call(yAnomalyScoreAxis.scale(yAnomalyScoreScale));
                }

                // Canvas related functions
                this.drawAnomalyPlot(this.context);

                // Restore old zoom values if they are there
                gX.call(xAxis.scale(this.transform.rescaleX(xScale)));

                // Canvas interaction
                let self = this;

                // Graphic must provide feedback on hovered items
                canvas.on('mousemove.inspection', function() { self.canvasMousemove(); });

                // Might be interesting to allow to select points in and show their degrees of anomaly
                canvas.on('click.inspection', function() { self.canvasClick(); });

                this.configureSelectionMode();
            },

            configureSelectionMode(){
                let margin = this.mainPlotParams.margin;
                let width  = this.mainPlotParams.width;
                let height = this.mainPlotParams.height;

                if (this.selectionMode === 'zoom-pan') { // Zoom
                    d3.select('#main-plot').select('svg')
                        .on('mousedown.modes',null)
                        .on('mousemove.modes',null)
                        .on('mouseup.modes',null)
                        .call(this.zoom);

                    d3.select('#main-plot').selectAll('canvas')
                        .on('mousedown.modes',null)
                        .on('mousemove.modes',null)
                        .on('mouseup.modes.modes',null)
                        .call(this.zoom);
                }
                else {
                    let svg = d3.select('#main-plot').select('svg')
                        .on('.zoom', null);

                    let canvases = d3.select('#main-plot').selectAll('canvas')
                        .on('.zoom', null);

                    let self = this;
                    let oldSelected  = self.selectedData.slice();

                    function selectMousedown() {
                        let mousePos = d3.mouse(this);
                        svg.append('rect')
                            .attrs(
                                {
                                    rx     : 0,
                                    ry     : 0,
                                    class  : 'selection',
                                    x      : mousePos[0],
                                    y      : 0,
                                    width  : 0,
                                    height : 0,
                                    x0     : mousePos[0],
                                    y0     : 0,
                                })
                            .style('background-color', '#EEEEEE')
                            .style('opacity', 0.18)
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                        oldSelected = self.selectedData.slice();
                    }

                    function selectMousemove() {
                        let selection = svg.select('rect.selection');
                        if (!selection.empty()) {
                            let mousePos = d3.mouse(this);

                            // Creates the selection box
                            let box = {
                                x      : parseInt(selection.attr('x'), 10),
                                y      : parseInt(selection.attr('y'), 10),
                                x0     : parseInt(selection.attr('x0'), 10),
                                y0     : parseInt(selection.attr('y0'), 10),
                                width  : parseInt(selection.attr('width'), 10),
                                height : parseInt(selection.attr('height'), 10)
                            };

                            let move = {
                                x : mousePos[0] - box.x0
                            };

                            if (move.x < 0) {
                                box.x = box.x0 + move.x;
                            }
                            else {
                                box.x = box.x0;
                            }

                            box.width = Math.abs(move.x);
                            box.height = self.plotHeight;

                            selection.attrs(box);

                            let newSelectedData = self.selectedData.slice();

                            if (self.selectionMode === 'drag-select') { // Make selection
                                self.anomalyProblemData.forEach((point, index) => {
                                    let tx = self.transform.applyX(self.preMappedX[index]);
                                    newSelectedData[index] = (tx >= box.x) && (tx <= (box.x + box.width));
                                    newSelectedData[index] = newSelectedData[index] || oldSelected [index];
                                });
                            }
                            else {  // De-select
                                self.anomalyProblemData.forEach((point, index) => {
                                    let tx = self.transform.applyX(self.preMappedX[index]);
                                    newSelectedData[index] = !(tx >= box.x && tx <= box.x + box.width);
                                    newSelectedData[index] = newSelectedData[index] && oldSelected [index];
                                });
                            }

                            self.$store.commit('updateSelectedData', newSelectedData);

                            // console.log(newSelectedData);


                        }
                    }

                    function selectMouseup() {
                        // remove selection frame
                        svg.selectAll('rect.selection').remove();
                    }

                    svg.on('mousedown.modes', selectMousedown)
                        .on('mousemove.modes', selectMousemove)
                        .on('mouseup.modes', selectMouseup);

                    canvases.on('mousedown.modes', selectMousedown)
                        .on('mousemove.modes', selectMousemove)
                        .on('mouseup.modes', selectMouseup);
                }
            },

            drawData(context) { // We take advantage of passing through all the points to tell if the mouse is over any point
                let x0 = this.transform.applyX(this.xMap(this.anomalyProblemData[0]));
                let y0 = this.yMap(this.anomalyProblemData[0]);
                let [mouseX0, mouseX1] = this.activeMouseInterval;
                let spottedMouseData = false;
                context.strokeStyle = this.colorAnomalyPlot.oneVariableStroke;
                context.beginPath();
                context.moveTo(x0, y0);
                this.anomalyProblemData.forEach((point, index) => { // as it finds the data near the mouse saves it to print after a rectangle centered in this loaction, must save both, y
                    let tx = this.transform.applyX(this.preMappedX[index]);
                    let ty = this.yMap(point);
                    context.lineTo(tx, ty);
                    if (!spottedMouseData && mouseX0 <= tx && tx <= mouseX1) {
                        spottedMouseData = true;
                        this.updateHoveredData({dataPoint: point, anomalyScore: this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected][index]});
                    }
                });
                context.stroke();
                return spottedMouseData;
            },

            drawAnomalyScore(context){
                let x0 = this.transform.applyX(this.xMap(this.anomalyProblemData[0]));
                let y0AS = this.yAnomalyScoreMap(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected][0]);
                context.strokeStyle = this.colorAnomalyPlot.multiVariableStroke;
                context.beginPath();
                context.moveTo(x0, y0AS);
                this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected].forEach((point, index) => {
                    let tx = this.transform.applyX(this.preMappedX[index]);
                    let ty = this.yAnomalyScoreMap(point);
                    context.lineTo(tx, ty);
                });
                context.stroke();
            },

            drawOneVarAnomalies(context){
                context.fillStyle = this.colorAnomalyPlot.oneVariableAnomaly;
                this.getDetectedOneVarAnomalies[this.variableChosen][this.oneVarAlgorithmSelected].forEach((point) => {
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.yMap(point);
                    context.beginPath();
                    context.arc(tx, ty, 3.3, 0, 2 * Math.PI);
                    context.fill();
                });
            },

            drawMultiVarAnomalies(context){
                context.fillStyle = this.colorAnomalyPlot.multiVariableAnomaly;
                this.getDetectedMultiVarAnomalies[this.multiVarAlgorithmSelected].forEach((point) => {
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.yAnomalyScoreMap(point);
                    context.beginPath();
                    context.arc(tx, ty, 3.3, 0, 2 * Math.PI);
                    context.fill();
                });
            },

            markSelectedData(context){
                context.fillStyle = this.colorAnomalyPlot.selectedData;
                this.anomalyProblemData.forEach((point, index) => {
                    if (this.selectedData[index]){
                        let tx = this.transform.applyX(this.preMappedX[index]);
                        let ty = 0;
                        if (this.activePlotTab === 'oneVariable'){
                            ty = this.yMap(point);
                        }else{
                            if (this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected].length) {
                                ty = this.yAnomalyScoreMap(this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected][index]);
                            }
                        }
                        context.beginPath();
                        context.arc(tx, ty, 5, 0, 2 * Math.PI);
                        context.fill();
                    }
                });
            },

            drawMouseFeedBack(context, spottedMouseData){
                // HOVERING
                // POINTS
                let x = this.transform.applyX(this.xMap(this.hoveredData.dataPoint));
                let y1 = this.yMap(this.hoveredData.dataPoint);
                let y2 = [];
                if (this.hoveredData.anomalyScore !== undefined){
                    y2 = this.yAnomalyScoreMap(this.hoveredData.anomalyScore);
                }
                if (spottedMouseData) {
                    context.fillStyle = this.colorAnomalyPlot.oneVariableStroke;
                    context.fillRect(x - 4, y1 - 4, 8, 8);
                    context.fillStyle = this.colorAnomalyPlot.multiVariableStroke;
                    context.fillRect(x - 4, y2 - 4, 8, 8);
                }
                // LINE
                context.strokeStyle = this.colorAnomalyPlot.indicatorStroke;
                context.beginPath();
                context.moveTo(x,0);
                context.lineTo(x,(this.mainPlotParams.height));
                context.stroke();

                // CLICKING
                // LINE
                if(this.clickedData.dataPoint.timestamp){ // Check a better way to do this
                    let x = this.transform.applyX(this.xMap(this.clickedData.dataPoint));
                    context.strokeStyle = this.colorAnomalyPlot.clickedData;
                    context.beginPath();
                    context.moveTo(x,0);
                    context.lineTo(x,(this.mainPlotParams.height));
                    context.stroke();
                }
            },

            drawAnomalyPlot(context) { // todo change the name of the function

                context.clearRect(0, 0, this.plotWidth, this.plotHeight);
                context.save();

                // Draw the data
                let spottedMouseData = this.drawData(context);

                this.markSelectedData(context);

                if (this.MultiVariateAnomalyScores[this.multiVarAlgorithmSelected].length) {
                    this.drawAnomalyScore(context);
                }
                if (this.oneVarAlgorithmSelected !== 'none'){
                    this.drawOneVarAnomalies(context);
                }
                if (this.multiVarAlgorithmSelected !== 'none'){
                    this.drawMultiVarAnomalies(context);
                }

                this.drawMouseFeedBack(context, spottedMouseData);

                context.restore();
            },

            getMouseXCoordenate(){
                // Gets the mouse x position on the graph
                let mousePos = d3.mouse(d3.select('#main-plot').select('canvas').node());
                return mousePos[0];
            },

            canvasMousemove() {
                // Gets the timestamp of the mouse
                let xMouseCoord = this.getMouseXCoordenate();
                this.updateActiveMouseInterval(xMouseCoord);
            },

            canvasClick() {
                this.$store.commit('setClickedData')
            },

            cancelSelection() {
                // Remove both clicked and selections
                this.$store.commit('clearSelectedData');
                this.$store.commit('clearClickedData');
            },

        },

        watch: {
            anomalyProblemData: function(val, oldVal) {
                this.$store.dispatch('updateAnomalyPlotData', val);
                this.updatePlot('timestamp', this.variableChosen);
            },

            plotOverlap: function(val, oldVal) {
                this.updatePlot('timestamp', this.variableChosen);
            },

            variableChosen: function(val, oldVal) {
                this.updatePlot('timestamp', val);
            },

            oneVarAlgorithmSelected: function(val, oldVal) {
                this.updatePlot('timestamp', this.variableChosen);
            },

            multiVarAlgorithmSelected: function(val, oldVal) {
                this.updatePlot('timestamp', this.variableChosen);
            },

            dummyDrawAnomalies: function(val, oldVal) {
                this.updatePlot('timestamp', this.variableChosen);
            },

            clickedData: function(val, oldVal) {
                this.drawAnomalyPlot(this.context)
            },// todo create a dynamic thing to display the data clicked

            // Where the mouse is, to give feedback of the position
            activeMouseInterval: function(val, oldVal) {
                this.drawAnomalyPlot(this.context);
            },


            selectionMode: function(val, oldVal) {
                this.configureSelectionMode();
            }
        },

        mounted() {
            window.addEventListener('resize', () => {
                this.updatePlot('timestamp', this.variableChosen);
            });
        }
    }
</script>

<style scoped>

</style>