class Tutorial {

    constructor() {        
        this.intro = introJs();
    }

    
    start_intro(objects, messages, classname, callback){
        
        if(messages.length==1){
            this.intro.setOption('showButtons',false).setOption('showBullets',false);
        }else{
            this.intro.setOption('showButtons',true).setOption('showBullets',true);
        }
        
        if(!classname){
            classname = 'introjs_tooltip';
        }
        
        var steps = [];
        var last_object = null;
        
        for(var i=0;i<messages.length;i++){

            if(!objects){
                steps.push({intro:messages[i]});
            }else{
                if(!objects[i]){
                    if(!last_object){
                        steps.push({intro:messages[i]});
                    }else{
                        steps.push({element:last_object,intro:messages[i]});
                    }
                }else{
                    last_object = objects[i];
                    steps.push({element:objects[i],intro:messages[i]});
                }
            }
        }
        
        console.log(steps);
        
        this.intro.setOption('showProgress', true).setOptions({steps:steps,tooltipClass:classname});
        this.intro.setOption('exitOnOverlayClick', false);
        this.intro.setOption('exitOnEsc', false);
        
        if(callback){
            this.intro.onchange(callback); 
        }
        
        this.intro.start();
    }    
    
        
    run_tutorial(){

        let sequence = [];
        
        sequence.push({"highlight":null,
                            "text":"In this experiment, you will solve a system architecting problem with the help of a virtual assistant called Daphne."
                        });

        sequence.push({"highlight":null,
                            "text":"The task at hand deals with designing a constellation of satellites for Earth observation. This experiment does not require any background knowledge in this area."
                        });
        
        sequence.push({"highlight":$('#arch_info_display_table')[0],
                            "text":"Each design is represented by a table as shown here. It shows which set of measurement instruments is assigned to fly in each orbit. Each row represents one spacecraft flying in a specified orbit. Orbits are defined by various parameters, such as altitude and inclination"
                        });
        
        sequence.push({"highlight":$('#arch_info_display_table')[0],
                            "text":"Each column represents what measurement instruments (sensors) are onboard each of those spacecraft. The instruments include spectrometers, lidars, radars, imagers, etc."
                        });
        
        sequence.push({"highlight":$('#arch_info_display_table')[0],
                            "text":"The real names of orbits and instruments were changed to numbers and alphabetical letters repectively to make the task simpler. There are total 5 candidate orbits, and 6 available measurement instruments."
                        });           // 6 instead of 12?
        
        
        sequence.push({"highlight": $('.cheatsheet')[0], // Highlight the cheatsheet that shows orbit and instrument info
                            "text":"Detailed information on what these orbits and instruments are is given in the cheatsheet when checking the Orbits and Instruments alias. You don't have to pay attention to this information for now, but it may come in handy later in the design task."
                        });
        
        sequence.push({"highlight":$('#main_plot_block')[0],
                            "text":"This is the plot that shows the main trade-off of the designs. Each dot here is a single design, and each design has associated science score (a measure of performance) and cost. The science score represents how much value each design brings to the climate monitoring community, and the cost is a measure of how much it is going to cost (in million dollars)."
                        });      
        
        sequence.push({"highlight":$('#main_plot_block')[0],
                            "text":"Your task in the experiment will be to find designs that maximize the science score while minimizing the cost."
                        });            
        
        sequence.push({"highlight":$('.columns > div > section')[0],
                            "text":"As you hover over each dot on the scatter plot, you can see the corresponding information being changed. If you click a dot, it is replaced by a cross. The cross means you have selected that design."
                        });
        
        sequence.push({"highlight":$('.panel.design_inspector')[0],
                            "text":"You can move the instruments from one orbit to another orbit, add new instruments, or remove them using drag-and-drop. After modifying the design, you can evaluate it using the <b>\"Evaluate Architecture\"</b> button on the top-right side. After the evaluation is finished, a cross will appear on the scatter plot with its location determined by the new science score and cost. It is very important to evaluate the new designs you make, as otherwise they won't get saved and you won't know how much you improved!"
                        });
        
        sequence.push({"highlight":$('.panel.design_inspector')[0],
                            "text":"In one of the tasks, <b>you will be asked to try to find good designs (maximizing science and minimizing cost)</b>, just using this method."
                        });
        
        sequence.push({"highlight":$('.navbar-menu')[0],
                            "text":"In another task, a virtual assistant called Daphne will help you find good designs. You can communicate with Daphne through this text input field. You can ask various questions here."
                        });
        
        
        sequence.push({"highlight":$('.navbar-menu')[0],
                            "text":"For example, you can ask what Daphne thinks about a specific design. Then Daphne will give her thoughts on the design along with some hints on how you might want to improve it. An example question (<i>you can try it!</i>) would be: \"What do you think of design D1000?\""
                        });

        sequence.push({"highlight":$('.cheatsheet')[0],
                            "text": "You can also ask about missions that have already been flown. The available questions for you are available in the lists of the cheatsheet. For example, check the Critic and Historian lists."
                        });

        sequence.push({"highlight":$('.cheatsheet')[0],
                            "text": "If you look at the historian list, you will see that there are strange looking words such as ${measurement} or ${year}. You can look at other lists such as Measurements, Missions or Technologies to know valid values for these fields. If a part of a question is inside brackets it means it is optional. One example question would be: \"What is the most common orbit for atmospheric lidars?\""
                        });
        
        sequence.push({"highlight":$('.cheatsheet')[0],
                            "text": "If you want to know the technology for one instrument of the experiment or the real name of an orbit along with its characteristics you just need to check the Orbits and Instruments alias lists."
                        });

        sequence.push({"highlight":$('#clock_div')[0],
                            "text": "Each stage of the experiment will last for 10 minutes. It is <i>very important</i> for us that you talk about what is going through your mind during the experiment. If you don't we'll remind you about it!"
                        });

        sequence.push({"highlight":null,
                            "text": "Remember, your objective is always the same: <b>increase the science score (make it go to the right) while keeping the cost as low as possible</b>. Whether you have Daphne available or not is randomized, so don't worry if you don't see it as soon as the experiment begins. With this being said, click on done to start the experiment!"
                        });
        
         
        let objects = [];
        let messages = [];
        let classname = "introjs_tooltip"
        let callback = null
        
        for(var i=0;i<sequence.length;i++){
            objects.push(sequence[i].highlight);
            messages.push(sequence[i].text);
        }        
    
        this.start_intro(objects,messages,classname,callback);
    }
    
}

