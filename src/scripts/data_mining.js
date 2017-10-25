class DataMining {

    constructor(ifeed) {
        this.support_threshold = 0.002;
        this.confidence_threshold = 0.2;
        this.lift_threshold = 1;  
        
        this.all_features = [];
        this.mined_features = [];
        this.added_features = [];
        
        this.margin = { top: 20, right: 20, bottom: 30, left:65 };
        this.width = 770 - 35 - this.margin.left - this.margin.right;
        this.height = 400 - 20 - this.margin.top - this.margin.bottom;
        
        this.df_i = 0;
        

        this.current_feature = { id:null, name:null, expression:null, metrics:null, added:"0", x0:-1, y0:-1, x:-1, y:-1 };
        this.current_feature_blink_interval = null;
        this.utopia_point = {id:null, name:'utopiaPoint', expression:null, metrics:null, x0:-1, y0:-1, x:-1, y:-1 };
        

        coloursRainbow = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
        colourRangeRainbow = d3.range(0, 1, 1.0 / (coloursRainbow.length - 1));
        colourRangeRainbow.push(1);

        // Create color gradient
        this.colorScaleRainbow = d3.scale.linear()
            .domain(colourRangeRainbow)
            .range(coloursRainbow)
            .interpolate(d3.interpolateHcl);

        // Needed to map the values of the dataset to the color scale
        this.colorInterpolateRainbow = d3.scale.linear()
            .domain(d3.extent([]))
            .range([0,1]);
        

        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;

        ifeed.UI_states.selection_changed = true;

        d3.select("#support_panel").select("#view3").select("g").remove();
        
        var guideline = d3.select("#support_panel").select("#view3")
                .append("g")
                .append("div")
                .style("width","900px")
                .style("margin","auto")

        guideline.append("div")
                .style("width","100%")
                .style("font-size","21px")
                .text("To run data mining, select target solutions on the scatter plot. Then click the button below.");

        guideline.append("div")
                .style("width","300px")
                .style("margin","auto")
                .append("button")
                .attr("id","run_data_mining_button")
                .style("margin-top","30px")
                .style("width","200px")
                .style("font-size","19px")
                .text("Run data mining");
        
        d3.selectAll("#run_data_mining_button").on("click", this.run);
    }

    run() {

        // If the target selection hasn't changed, then use previously obtained driving features to display
        if(ifeed.UI_states.selection_changed == false && mined_features != null){
            self.display_features(self.all_features);
            return;
        }

        // Remove all highlights in the scatter plot (retain target solutions)
        ifeed.main_plot.cancel_selection('remove_highlighted');

        var selectedArchs = d3.selectAll(".dot.main_plot.selected:not(.hidden)")[0];
        var nonSelectedArchs =  d3.selectAll(".dot.main_plot:not(.selected):not(.hidden)")[0];

        var numOfSelectedArchs = selectedArchs.length;
        var numOfNonSelectedArchs = nonSelectedArchs.length;

        if (numOfSelectedArchs==0){
            
            alert("First select target solutions!");
            
        }else{        

            // Store the id's of all dots
            var selected = [];
            var non_selected = [];

            for (var i = 0; i < numOfSelectedArchs; i++) {
                var id = selectedArchs[i].__data__.id;
                selected.push(id);
            }
            for (var i = 0; i < numOfNonSelectedArchs; i++) {
                var id = nonSelectedArchs[i].__data__.id;
                non_selected.push(id);
            }

            self.mined_features = self.get_driving_features(selected,non_selected,self.support_threshold,self.confidence_threshold,self.lift_threshold);

            self.all_features = self.mined_features;
            
            if(self.all_features.length==0){
                return;
            }
            
            self.display_features(self.all_features);

            ifeed.UI_states.selection_changed = false;
        }
    }
    
    
    
    get_driving_features(selected,non_selected,support_threshold,confidence_threshold,lift_threshold) {

        var output;
        $.ajax({
            url: "/api/data-mining/get-driving-features/",
            type: "POST",
            data: {ID: "get_driving_features",
                    selected: JSON.stringify(selected),
                    non_selected:JSON.stringify(non_selected),
                    supp:support_threshold,
                    conf:confidence_threshold,
                    lift:lift_threshold
                  },
            async: false,
            success: function (data, textStatus, jqXHR)
            {
                if(data=="[]"){
                    alert("No driving feature mined. Please try modifying the selection. (Try selecting more designs)");
                }
                output = data;
            },
            error: function (jqXHR, textStatus, errorThrown)
            {alert("error");}
        });

        return output;
    }
    
    


    display_features(source) {

        document.getElementById('tab3').click();
        
        ifeed.main_plot.highlight_support_panel();

        // Set variables
        df_i=0;

        // Remove previous plot
        d3.select("#view3").select("g").remove();

        var tab = d3.select('#view3').append('g');

        // Create plot div's
        var feature_plot = tab.append('div')
            .attr('class','feature_plot')
            .style('width', self.width + self.margin.left + self.margin.right)
            .style('height', self.height + self.margin.top + self.margin.bottom);

        // Create a new svg
        var svg = feature_plot.append("svg")
            .attr('class','feature_plot figure')
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        feature_plot.append('div')
            .attr('class','feature_plot venn_diagram')
            .append('div')
            .text('Total number of designs: ' + ifeed.main_plot.get_num_of_archs());
        
        
        var objects = svg.append("svg")
                .attr("class", "objects feature_plot")
                .attr("width", self.width)
                .attr("height", self.height)
                .style('margin-bottom','30px');

        // Initialize location
        for(var i=0;i<source.length;i++){
            source[i].x0 = -1;
            source[i].y0 = -1;
            source[i].id = df_i++;
        }

        self.update_feature_plot(source);
    }
    
    
    
    

    update_feature_plot(source, remove_last_feature) {
        
        function get_utopia_point(){
            // Utopia point
            return d3.selectAll('.dot.feature_plot').filter(function(d){
                if(d.name=="utopiaPoint"){
                   return true;
                }
                return false;
            });
        }


        function get_current_feature(){
            // The current feature
            return d3.selectAll('.dot.feature_plot').filter(function(d){
                if(d.added=="0"){
                   return true;
                }
                return false;
            });

        }


        // Set variables
        var margin = self.margin;
        var width = self.width;
        var height = self.height;

        var duration = 500;

        var supps = [];
        var lifts = [];
        var conf1s = [];
        var conf2s = [];

        var scores=[];   
        var maxScore = -1;

        
        for (var i=0;i<self.all_features.length;i++){
            
            supps.push(self.all_features[i].metrics[0]);
            lifts.push(self.all_features[i].metrics[1]);
            conf1s.push(self.all_features[i].metrics[2]);
            conf2s.push(self.all_features[i].metrics[3]);
            
            var score = 1-Math.sqrt(Math.pow(1-conf1s[i],2)+Math.pow(1-conf2s[i],2));
            scores.push(score);

            if(score > maxScore){
                maxScore = score;
            }
        }

        
        // Add utopia point to the list
        var max_conf1 = Math.max.apply(null, conf1s);
        var max_conf2 = Math.max.apply(null, conf2s);
        var max_conf = Math.max(max_conf1, max_conf2);

        // Add utopia point
        self.utopia_point.metrics=[Math.max.apply(null, lifts),Math.max.apply(null, supps),max_conf,max_conf];

        // Insert the utopia point to the list of features
        self.all_features.splice(0, 0, self.utopia_point);

        // Add score for the utopia point (0.2 more than the best score found so far)
        scores.splice(0,0,Math.max.apply(null,scores)+0.2); 

        
        // Set the axis to be Conf(F->S) and Conf(S->F)
        var x = 2;
        var y = 3;

        // setup x
        // data -> value
        var xValue = function (d) {
            return d.metrics[x];
        }; 
        // value -> display
        var xScale = d3.scale.linear().range([0, width]); 

        // don't want dots overlapping axis, so add in buffer to data domain 
        var xBuffer = (d3.max(self.all_features, xValue) - d3.min(self.all_features, xValue)) * 0.05;

        xScale.domain([d3.min(self.all_features, xValue) - xBuffer, d3.max(self.all_features, xValue) + xBuffer]);

        // data -> display
        var xMap = function (d) {
            return xScale(xValue(d));
        }; 
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");


        // setup y
        // data -> value
        var yValue = function (d) {
            return d.metrics[y];
        };
        // value -> display
        var yScale = d3.scale.linear().range([height, 0]); 

        var yBuffer = (d3.max(self.all_features, yValue) - d3.min(self.all_features, yValue)) * 0.05;
        yScale.domain([d3.min(self.all_features, yValue) - yBuffer, d3.max(self.all_features, yValue) + yBuffer]);
        // data -> display
        var yMap = function (d) {
            return yScale(yValue(d));
        }; 
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        // Set the new locations of all the features
        for(var i=0;i<self.all_features.length;i++){
            self.all_features[i].x = xMap(self.all_features[i]);
            self.all_features[i].y = yMap(self.all_features[i]);
            if(!self.all_features[i].x0){
                // If previous location has not been initialize, save the current location
                self.all_features[i].x0 = self.all_features[i].x;
                self.all_features[i].y0 = self.all_features[i].y;
            }
        }
        
        self.xScale=xScale;
        self.yScale=yScale;
        self.xAxis=xAxis;
        self.yAxis=yAxis;


        //Needed to map the values of the dataset to the color scale
        self.colorInterpolateRainbow = d3.scale.linear()
                .domain(d3.extent(scores))
                .range([0,1]);

        // Set zoom
        d3.select('.feature_plot.figure').call(

                    d3.behavior.zoom()
                    .x(xScale)
                    .y(yScale)
                    .scaleExtent([0.2, 50])
                    .on("zoom", function (d) {

                        var scale = d3.event.scale;

                        d3.select('.feature_plot.figure').select(".x.axis").call(xAxis);
                        d3.select('.feature_plot.figure').select(".y.axis").call(yAxis);

                        d3.selectAll('.dot.feature_plot')
                            .attr("transform", function (d) {
                                var xCoord = xMap(d);
                                var yCoord = yMap(d);
                                return "translate(" + xCoord + "," + yCoord + ")";
                            });        
                    })

                )
                .append("g")        
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");



        var svg = d3.select('.feature_plot.figure').select('g')

        d3.select('.x.axis.feature_plot').remove();
        d3.select('.y.axis.feature_plot').remove();
        d3.select('.axisLine.hAxisLine.feature_plot').remove();
        d3.select('.axisLine.vAxisLine.feature_plot').remove();

        // x-axis
        svg.append('g')
                .attr("class", "x axis feature_plot")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label feature_plot")
                .attr("x", self.width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text('Confidence(F->S)')
                .style('font-size','15px');

        // y-axis
        svg.append('g')
                .attr("class", "y axis feature_plot")
                .call(yAxis)
                .append("text")
                .attr("class", "feature_plot label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text('Confidence(S->F)')
                .style('font-size','15px');


        var objects = d3.select(".objects.feature_plot")

        //Create main 0,0 axis lines:
        objects.append("svg:line")
                .attr("class", "axisLine hAxisLine feature_plot")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", self.width)
                .attr("y2", 0)
                .attr("transform", "translate(0," + yScale(0) + ")");

        objects.append("svg:line")
                .attr("class", "axisLine vAxisLine feature_plot")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", self.height)
                .attr("transform", "translate(" + xScale(0) + ",0)");

        // Remove unnecessary points
        objects.selectAll('.dot.feature_plot')
                .data(self.all_features)
                .exit()
                .remove();

        // Create new dots
        objects.selectAll(".dot.feature_plot")
                .data(self.all_features)
                .enter()
                .append('path')
                .attr('class','point dot feature_plot')
                .attr("d", d3.svg.symbol().type('triangle-up').size(120))
                .attr("transform", function (d) {
                    return "translate(" + d.x0 + "," + d.y0 + ")";
                })
                .style("stroke-width",1);


        // Utopia point: modify the shape to a star
        get_utopia_point().attr('d',d3.symbol().type(d3.symbolStar).size(120));

        // The current feature: modify the shape to a cross
        var _current_feature = get_current_feature().attr('d',d3.symbol().type(d3.symbolCross).size(120));

        _current_feature.shown=true;

        function blink() {
            if(_current_feature.shown) {
                _current_feature.style("opacity",0);
                _current_feature.shown = false;
            } else {
                _current_feature.style("opacity",1);
                _current_feature.shown = true;
            }
        }

        if(self.current_feature_blink_interval != null){
            clearInterval(self.current_feature_blink_interval);
            
            d3.selectAll('.dot.feature_plot').filter(function(d){
                if(d.added=="1"){
                   return true;
                }
                return false;
            }).style('opacity',1);
        }
        self.current_feature_blink_interval = setInterval(blink, 350);


        d3.selectAll('.dot.feature_plot').filter(function(d,i){
                if(d.name=="utopiaPoint"){
                    return false;
                }
                return true;
            })
            .on("mouseover", self.feature_mouseover)
            .on('mouseout', self.feature_mouseout)
            .on('click', self.feature_click);   


    //    var legend = svg.selectAll(".legend")
    //      .data(color.domain())
    //    .enter().append("g")
    //      .attr("class", "legend")
    //      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    //
    //    legend.append("rect")
    //      .attr("x", width - 18)
    //      .attr("width", 18)
    //      .attr("height", 18)
    //      .style("fill", color);
    //
    //    legend.append("text")
    //      .attr("x", width - 24)
    //      .attr("y", 9)
    //      .attr("dy", ".35em")
    //      .style("text-anchor", "end")
    //      .text(function(d) { return d; });


        //Transition the colors to a rainbow
        function updateRainbow() {
            d3.selectAll(".dot.feature_plot")
                .style("fill", function (d,i) { return self.colorScaleRainbow(self.colorInterpolateRainbow(scores[i])); })
        }
        updateRainbow();

        // Remove the utopia point
        self.all_features.splice(0,1);

        if(remove_last_feature){
            // Remove the last feature, as it had been added temporarily to display the cursor
            self.all_features.pop();
            self.added_features.pop();
        }

        // The current feature
        _current_feature.style('fill',"black");    

        d3.selectAll('.dot.feature_plot').transition()
            .duration(duration)
            .attr("transform",function(d){
                return "translate(" + d.x + "," + d.y + ")";
            });   
                
    }
    
    
    
    

    feature_click(d){
        // Replaces the current feature expression with the stashed expression
        ifeed.feature_application.update_feature_application('update');
    }


    feature_mouseover(d){

        var id= d.id; 
        var expression = d.expression;
        var metrics = d.metrics;
        var conf = d.metrics[2];
        var conf2 = d.metrics[3];

        // Set variables
        var margin = self.margin;
        var width = self.width;
        var height = self.height;

        var mouseLoc_x = d3.mouse(d3.select(".objects.feature_plot")[0][0])[0];
        var mouseLoc_y = d3.mouse(d3.select(".objects.feature_plot")[0][0])[1];

        var tooltip_location = {x:0,y:0};
        var tooltip_width = 360;
        var tooltip_height = 200;

        var h_threshold = (width + margin.left + margin.right)*0.5;
        var v_threshold = (height + margin.top + margin.bottom)*0.55;


        if(mouseLoc_x >= h_threshold){
            tooltip_location.x = -10 - tooltip_width;
        } else{
            tooltip_location.x = 10;
        }
        if(mouseLoc_y < v_threshold){
            tooltip_location.y = 10;
        } else{
            tooltip_location.y = -10 -tooltip_height;
        }

        var svg = d3.select(".objects.feature_plot");
        var tooltip = svg.append("g")
                        .attr("id","tooltip_g");

        tooltip.append("rect")
                    .attr("id","tooltip_rect")
                    .attr("transform", function(){
                        var x = mouseLoc_x + tooltip_location.x;
                        var y = mouseLoc_y + tooltip_location.y;
                        return "translate(" + x + "," + y + ")";
                     })
                    .attr("width",tooltip_width)
                    .attr("height",tooltip_height)
                    .style("fill","#4B4B4B")
                    .style("opacity", 0.92);    

        var fo = tooltip
                        .append("foreignObject")
                        .attr('id','tooltip_foreignObject')
                        .attr("x",function(){
                            return mouseLoc_x + tooltip_location.x;
                        })
                        .attr("y",function(){
                           return mouseLoc_y + tooltip_location.y; 
                        })
                        .attr({
                            'width':tooltip_width,
                            'height':tooltip_height  
                        })
                        .data([{id:id, expression:expression, metrics:metrics}]) 
                        .html(function(d){
                            var output= "" + ifeed.label.pp_feature(d.expression) + "<br><br> lift: " + round_num(d.metrics[1]) + 
                            "<br> Support: " + round_num(d.metrics[0]) + 
                            "<br> Confidence(F->S): " + round_num(d.metrics[2]) + 
                            "<br> Confidence(S->F): " + round_num(d.metrics[3]) +"";
                            return output;
                        }).style("padding","8px")
                        .style('color','#F7FF55')
                        .style('word-wrap','break-word');   


        // Update the placeholder with the driving feature and stash the expression    
        ifeed.feature_application.update_feature_application('temp',expression);
        ifeed.filter.apply_filter_expression(ifeed.feature_application.parse_tree(ifeed.feature_application.root));
        self.draw_venn_diagram(); 
    }



    feature_mouseout(d){

        var id = d.id;

        // Remove the tooltip
        d3.selectAll("#tooltip_g").remove();

        // Remove all the features created temporarily

        // Bring back the previously stored feature expression
        ifeed.feature_application.update_feature_application('restore');
        ifeed.filter.apply_filter_expression(ifeed.feature_application.parse_tree(ifeed.feature_application.root));
        self.draw_venn_diagram();       

    }


    
    
    
    add_feature_to_plot(expression){

        function find_equivalent_feature(metrics,indices){

            for(var i=0;i<self.all_features.length;i++){
                var _metrics = self.all_features[i].metrics;
                var match = true;
                for(var j=0;j<indices.length;j++){
                    var index = indices[j];
                    if(round_num(metrics[index])!=round_num(_metrics[index])){
                        match=false;
                    }
                }
                if(match){
                    return self.all_features[i];
                }
            }
            return null;
        }
        
        
        ifeed.filter.apply_filter_expression(expression);
        

        if(!expression || expression==""){

            // Assign new indices for the added features
            for(var i=0;i<self.added_features.length;i++){
                self.all_features[self.all_features.length-self.added_features.length+i].added = ""+self.added_features.length-i + 1;
            }        
            
            self.update_feature_plot([self.current_feature],false);

        }else{        

            // Compute the metrics of a feature
            var total = ifeed.main_plot.get_num_of_archs();
            var intersection = d3.selectAll('.dot.main_plot.selected.highlighted')[0].length;
            var selected = d3.selectAll('.dot.main_plot.selected')[0].length;
            var highlighted = d3.selectAll('.dot.main_plot.highlighted')[0].length;

            var p_snf = intersection/total;
            var p_s = selected/total;
            var p_f = highlighted/total;

            var supp = p_snf;
            var conf = supp / p_f;
            var conf2 = supp / p_s;
            var lift = p_snf/(p_f*p_s); 
            var metrics = [supp, lift, conf, conf2];

            // Stash the previous location
            var x=self.current_feature.x;
            var y=self.current_feature.y;

            // Define new feature
            self.current_feature = {id:df_i++,name:expression,expression:expression,metrics:metrics,added:"0",x0:x,x:x,y0:y,y:y};

            // Check if there exists a feature whose metrics match with the current feature's metrics
            var matched = find_equivalent_feature(metrics,[2,3]);       

            // Add new feature to the list of added features
            self.added_features.push(self.current_feature);
            self.all_features.push(self.current_feature);  

            // Stash the previous locations of all features
            for(var i=0;i<self.all_features.length;i++){
                self.all_features[i].x0 = self.all_features[i].x;
                self.all_features[i].y0 = self.all_features[i].y;
            }

            // Assign new indices for the added features
            for(var i=0;i<self.added_features.length;i++){
                self.all_features[self.all_features.length-self.added_features.length+i].added = ""+self.added_features.length-1-i;
            }

            document.getElementById('tab3').click();
            
            ifeed.main_plot.highlight_support_panel();

            // Display the driving features with newly added feature
            if(matched){ 
                self.update_feature_plot([self.current_feature],true);
            }else{
                self.update_feature_plot([self.current_feature],false);
            }

        }
    }
    
    
    
    
    
    draw_venn_diagram(){

        var venn_diagram_container = d3.select('.feature_plot .venn_diagram').select('div');
        
        if(venn_diagram_container[0][0]==null) return;

        venn_diagram_container.select("svg").remove();
        
        var svg = venn_diagram_container
                                    .append("svg")
                                    .style('width','320px')  			
                                    .style('border-width','3px')
                                    .style('height','305px')
                                    .style('border-style','solid')
                                    .style('border-color','black')
                                    .style('border-radius','40px')
                                    .style('margin-top','10px')
                                    .style('margin-bottom','10px'); 

        
        var total = ifeed.main_plot.get_num_of_archs();
        var intersection = d3.selectAll('.dot.main_plot.selected.highlighted:not(.hidden)')[0].length;
        var selected = d3.selectAll('.dot.main_plot.selected:not(.hidden)')[0].length;
        var highlighted = d3.selectAll('.dot.main_plot.highlighted:not(.hidden)')[0].length;

        
        var left_margin = 50;
        var c1x = 110;
        // Selection has a fixed radius
        var r1 = 70;
        var S_size = selected;

        svg.append("circle")
            .attr("id","venn_diag_c1")
            .attr("cx", c1x)
            .attr("cy", 180-30)
            .attr("r", r1)
            .style("fill", "steelblue")
            .style("fill-opacity", ".5");

        svg.append("text")
            .attr("id","venn_diag_c1_text")
            .attr("x",c1x-90)
            .attr("y",180+r1+50-30)
            .attr("font-family","sans-serif")
            .attr("font-size","18px")
            .attr("fill","steelblue")
            .text("Selected:" + S_size );

        var supp, conf, conf2, lift;

        if(intersection==0){
            var supp = 0;
            var F_size = highlighted;
        }else if(highlighted==0){
            var supp = 0;
            var F_size = 0;
        }else{

            var p_snf = intersection/total;
            var p_s = selected/total;
            var p_f = highlighted/total;

            supp = p_snf;
            conf = supp / p_f;
            conf2 = supp / p_s;
            lift = p_snf/(p_f*p_s); 

            var F_size = supp * 1/conf * total;
            var S_size = supp * 1/conf2 * total;


            // Feature 
            var	r2 = Math.sqrt(F_size/S_size)*r1;
            var a1 = Math.PI * Math.pow(r1,2);
            var a2 = Math.PI * Math.pow(r2,2);
            // Conf(F->S) * |F| = P(FnS)
            var intersection = supp * ifeed.main_plot.get_num_of_archs() * a1 / S_size;

            var c2x;
            if (conf2 > 0.999){
                c2x = c1x + r2 - r1;
            }else{
                var dist;
                $.ajax({
                    url: "/api/ifeed/venn-diagram-distance/",
                    type: "POST",
                    data: {a1: a1,
                           a2: a2,
                           intersection: intersection},
                    async: false,
                    success: function (data, textStatus, jqXHR)
                    {
                        dist = + data;
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {alert("error");}
                });
                c2x = c1x + dist;
            }

            svg.append("circle")
                .attr("id","venn_diag_c2")
                .attr("cx", c2x)
                .attr("cy", 180-30)
                .attr("r", r2)
                .style("fill", "brown")
                .style("fill-opacity", ".5");

        }


        svg.append("text")
            .attr("id","venn_diag_int_text")
            .attr("x",left_margin-10)
            .attr("y",70-30)
            .attr("font-family","sans-serif")
            .attr("font-size","18px")
            .attr("fill","black")
            .text("Intersection: " + Math.round(supp * total));


        svg.append("text")
            .attr("id","venn_diag_c2_text")
            .attr("x",c1x+60)
            .attr("y",180+r1+50-30)
            .attr("font-family","sans-serif")
            .attr("font-size","18px")
            .attr("fill","brown")
            .text("Features:" + Math.round(F_size) );
    }
    
}