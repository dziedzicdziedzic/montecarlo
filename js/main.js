signs = ["<", "<=", ">=", ">"];

// var numOfConstraints = document.getElementById('constraints').value;
// var numOfVariables = document.getElementById('variables').value;

var amountOfRandomlyGeneratedSituations = 1000;


const createConstraints= () => {
    var numOfConstraints = document.getElementById('constraints').value;
    var numOfVariables = document.getElementById('variables').value;
    var parentForm = document.getElementById('constraintForm');
    for(var i=0; i<numOfConstraints;++i){
        var constraintLine = document.createElement("div");
        constraintLine.setAttribute('id', 'div' + i);
        for(var j=0; j<numOfVariables; ++j){
            var variables = document.createElement("input");
            variables.setAttribute('type', 'text');
            variables.setAttribute('id','input' +  i + j);
            variables.setAttribute('placeholder', 'x ' + j)
            constraintLine.appendChild(variables);
        }
        var sign = document.createElement("select");
        
        for(var k=0; k<signs.length; k++){
            var opt = document.createElement("option");
            opt.innerHTML = signs[k];
            sign.appendChild(opt);
        }

        var constraint = document.createElement("input");
        constraint.setAttribute('type', 'text');
        constraint.setAttribute('id','constraint'+ i);
        constraint.setAttribute('placeholder', 'constraint');

        constraintLine.appendChild(sign);
        constraintLine.appendChild(constraint)
        var linebreak = document.createElement('br');
        parentForm.appendChild(constraintLine);
        parentForm.appendChild(linebreak);
    }
}

const createGoal = () => {
    var numOfVariables = document.getElementById('goalvariables').value;
    var parent = document.getElementById('goalForm');
    for(var i=0; i<numOfVariables; ++i){
        var variables = document.createElement("input");
            variables.setAttribute('type', 'text');
            variables.setAttribute('id','input' +  i);
            variables.setAttribute('placeholder', 'x ' + i)
            parent.appendChild(variables);
    }
    var minmax = document.createElement("select");
    var opt1 = document.createElement('option');
    opt1.setAttribute('value', 'min');
    opt1.innerHTML = 'min';
    var opt2 = document.createElement('option');
    opt2.setAttribute('value', 'max');
    opt2.innerHTML = 'max';
    minmax.appendChild(opt1);
    minmax.appendChild(opt2);
    parent.appendChild(minmax);
}


const getConstraints= () => {
    var form  = document.getElementById('constraintForm');
    var listOfNodes = form.childNodes;
    var listOfConstraints=[];
    for(var d in listOfNodes){
         if(listOfNodes[d].tagName==='DIV'){
             var listOfValues=[];
             var divChildren = listOfNodes[d].childNodes;
             for(var v in divChildren){
                 if(divChildren[v].tagName === 'INPUT'){
                    listOfValues.push(divChildren[v].value);
                 }
             }
             listOfConstraints.push(listOfValues);
         }   
    }
    return listOfConstraints;
    
}

const performMonteCarlo = (accuracy) => {
    var radius = document.getElementById('radius').value;
    var numOfVariables = document.getElementById('variables').value;
    var initList = [];
    for(var i=0; i<numOfVariables; ++i){
        initList.push(0);
    }
    var ob1 = findBestResult(initList, radius);
    prev = ob1.sum;
    initList = ob1.list;
    //console.log('prev: ' + prev)
    // console.log(initList);
    ob1 = findBestResult(initList,radius);
    curr = ob1.sum
    initList = ob1.list;
    //console.log('curr: ' + curr)
    //console.log(initList);

    while(Math.abs(curr-prev)>accuracy){
        prev = curr;
        var obj = findBestResult(initList, radius);
        // console.log(obj);
        curr = obj.sum;
        initList = obj.list;
        radius*=0.8;
    }

    var retObj = {
        list: initList,
        goal: curr
    }
    

    var string='';
    for(var x in retObj.list){
        string += retObj.list[x] + '<br/>';
    }
    var bestFound = document.getElementById('bestFound');
    bestFound.innerHTML = string;

    var result = document.getElementById('result');
    result.innerHTML = retObj.goal;
    


    
}

const findBestResult = (initList,r) =>{
    var numOfConstraints = document.getElementById('constraints').value;
    var numOfVariables = document.getElementById('variables').value;
    var whichGoal = document.getElementById('goalForm').lastChild.value;
    var constraintMatrix = getConstraints();
    // var checkList = {
    //     list: [1, 1],
    //     sum: [3,1,1]    
    // }
    var checkList = generateListOfCoefficients (initList, r);
    var goodList = checkIfConstraintsAreMet (checkList);

    console.log('checklist:');
    console.log(checkList);
    console.log('goodlist:');   
    console.log(goodList);

    var eq=0;
    var goalNodes = document.getElementById('goalForm').childNodes;
    var goalCoefficients=[];    
    var firstTime = true;

    for(var x in goalNodes){
        if(goalNodes[x].tagName === 'INPUT'){
            goalCoefficients.push(goalNodes[x].value);
        }
    }

    // {
    //     "list": [
    //       66.43236457724026,
    //       81.20982913152416
    //     ],
    //     "sum": [
    //       3011.953732392424,
    //       1875.0161245510858,
    //       66.43236457724026,
    //       66.43236457724026,
    //       81.20982913152416,
    //       81.20982913152416
    //     ]
    //   }


    var listWithBestResult= []
    var bestResult;
    whichGoal = document.getElementById('goalForm').lastChild.value;

    for(var set in goodList){
        eq=0;
        for (var x=0; x<numOfVariables; ++x){
            eq += goodList[set][x]*goalCoefficients[x];
        }

        if(firstTime){
            listWithBestResult = goodList[set];
            bestResult=eq;
            firstTime = false;
        }

        if (whichGoal === 'min'){
            if(eq<bestResult){
                bestResult=eq;
                listWithBestResult = goodList[set];
            }
        }

        else{
            if(eq>bestResult){
                bestResult=eq;
                listWithBestResult = goodList[set];
            }
        }
    }

    var returnObj = {
        list: listWithBestResult,
        sum: eq,
    }
    return returnObj;
    
   
}

// const calculate = (prevVarList, r) => {
//     largeList = generateRandomNums(prevVarList, r);
//     for(var arr)


// }

const generateListOfCoefficients = (initialValueList, r) =>{
    listOfRecords = generateRandomNums (initialValueList, r);
    //console.log(listOfRecords);
    var numOfConstraints = document.getElementById('constraints').value;
    var numOfVariables = document.getElementById('variables').value;
    var constraintMatrix = getConstraints();
    var outcomes = [];
    var helper = [];
    var sum=0;
    for(var arr in listOfRecords){
        for (var i=0; i<numOfConstraints; ++i){
            sum=0;
            for (var j = 0; j<numOfVariables; ++j){
                //console.log('record: ' + listOfRecords[arr][j]);
                //  console.log('matrix: ' + constraintMatrix[i][j]);
                sum += listOfRecords[arr][j]*constraintMatrix[i][j];
                //console.log('sum: '+ sum);
            }
            helper.push(sum);
        }
        var obj = {
            list: listOfRecords[arr],
            sum: helper
        }
        outcomes.push(obj);
        helper=[];
    }
    //console.log('outcomes:');
    //console.log(outcomes);
    return outcomes;
}

const checkIfConstraintsAreMet= (coefficientList) => {
    var divList = document.getElementById('constraintForm').childNodes;
    var constraints = getConstraints();
    var numOfConstraints = document.getElementById('constraints').value;
    var numOfVariables = document.getElementById('variables').value;
    //console.log(constraints[0]);
    var readyList = []
    var inputsigns = [];
    for(var x in divList){
        if(divList[x].tagName === 'DIV'){
            childList = divList[x].childNodes;            
            for(var div in childList){
                if (childList[div].tagName === 'SELECT'){
                    inputsigns.push(childList[div].value);
                }
            }
        }
    }
    //console.log(inputsigns);
    for(var i=0; i<amountOfRandomlyGeneratedSituations; ++i){
        var flag = true;
        //console.log(constraints);
        //console.log('coeff');
        // console.log(coefficientList);
        // console.log(coefficientList[i]);
        
        for(var j=0; j<numOfConstraints; ++j){
            // console.log('coeff');
            // console.log(constraints[j][numOfConstraints-1]);
            // console.log(coefficientList[i].sum[j]);
            //console.log(numOfConstraints -1);
            switch(inputsigns[j]){
                case "<":
                    if (!(coefficientList[i].sum[j]<constraints[j][numOfVariables])){
                        flag=false;
                    }
                    break;
                case "<=":
                    //console.log('wchodze')
                    if (!(coefficientList[i].sum[j]<=constraints[j][numOfVariables])){
                        
                        flag=false;
                    }
                    //console.log('wychodzez casa');
                    break;
                // case "=":
                //     if (!(coefficientList[i].sum[j]==constraints[j][numOfConstraints-1])){
                //         flag=false;
                //     }
                //     break;
                case ">=":
                    if (!(coefficientList[i].sum[j]>=constraints[j][numOfVariables])){
                        flag=false;
                    }
                    break;
                case ">":
                    if (!(coefficientList[i].sum[j]>constraints[j][numOfVariables])){
                        flag=false;
                    }
                    break;
             }
             //console.log('wychodze');
            }
            if(flag){
                readyList.push(coefficientList[i].list);
        }
    }
    return readyList;
}

const generateRandomNums = (initialValueList, r) => {
    var numOfVariables = document.getElementById('variables').value;
    var listOfRecords = [];
    for(var i=0; i<amountOfRandomlyGeneratedSituations; ++i){
        var record = [];
        for(var j=0; j<numOfVariables; ++j){
            x = initialValueList[j] + (Math.random() * r - r/2);
            record.push(x);
        }
        listOfRecords.push(record)
    }
    // console.log('randomly generated:')
    // console.log(listOfRecords);
    return listOfRecords;
}
