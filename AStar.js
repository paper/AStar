/**==========================================================================
  A* 算法
  
  Author      paper
  Date        2014-08
  Site        https://github.com/paper
  
  Reference   http://www.policyalmanac.org/games/aStarTutorial.htm
=============================================================================*/ 


var r = [];
var boxDOM = []

// 行列，可编辑
var row = 25; // 行
var col = 25; // 列

var width = 20;
var height = 20;
var space = 1;

var begin_elem = null;
var end_elem = null;

var box = document.getElementById("box");
var msg = document.getElementById("msg");

function init(){
  
  for(var i = 0; i < row; i++){
    var r_temp = [];
    
    for(var j = 0; j < col; j++){
      
      // 其实可以设置0.5 ，这样障碍物和空格的概率一样，但是这样会出现比较多的死胡同
      // 为了看效果，估计设置稍微较大的值
      if( Math.random() < 0.7 ){
        // 不是障碍物
        r_temp.push(0);
      }else{
        // 障碍物
        r_temp.push(1);
      }
    }
    
    r.push(r_temp);
  }
  
}//end init


function createMap(){

  box.style.display = "none";
  
  for(var i = 0, len = r.length; i < len; i++){
    var t = r[i];
    var dom_temp = [];

    for( var j = 0, len2 = t.length; j<len2; j++ ){
      var span = document.createElement("span");
      
      if(t[j] == 1 ){
        span.className = "block";
      }
      
      span.style.left = (width + space) * j + "px";
      span.style.top = (height + space) * i + "px";
      
      span.x = j;
      span.y = i;
      span.G = 0;
      span.H = 0;
      span.F = span.G + span.H;
      
      box.appendChild(span);
      dom_temp.push(span);
    }
    
    boxDOM.push(dom_temp);
  }
  
  box.style.display = "block";
  
}//end createMap


function createAB(){
  var A = true;
  var B = true;
  
  while(A){
    var x = parseInt( Math.random() * col, 10);
    var y = parseInt( Math.random() * row, 10);
    
    if( r[y][x] == 0 ){
      boxDOM[y][x].className = "A";
      boxDOM[y][x].appendChild( document.createTextNode("起") );
      A = false;
      
      begin_elem = boxDOM[y][x];
    }
    
  }
  
  while(B){
    var x = parseInt( Math.random() * col, 10);
    var y = parseInt( Math.random() * row, 10);
    
    if( r[y][x] == 0 && boxDOM[y][x].className != "A" ){
      boxDOM[y][x].className = "B";
      boxDOM[y][x].appendChild( document.createTextNode("终") );
      B = false;
      
      end_elem = boxDOM[y][x];
    }
    
  }
  
}//end createAB


init();
createMap();
createAB();

// 开启列表, 存入坐标的join值
// 初始化起始格在开启列表
var open_list = [ [begin_elem.x, begin_elem.y].join() ];

// 关闭列表, 存入坐标的join值
var close_list = [];

var father_list = [];

function getElemFormList(v){
  var r = v.split(",");
  var x = r[0];
  var y = r[1];
  
  return boxDOM[y][x];
}

function pushElemIntoList(list, elem){
  list.push( [elem.x, elem.y].join() );
}

function removeElemFormList(list, elem){
  var v = [elem.x, elem.y].join();
  
  var index = list.indexOf(v);
  
  if( index != -1 ){
    list.splice(index, 1);
  }else{
    return null;
  }
}

function isInElemFromList(list, elem){
  var v = [elem.x, elem.y].join();
  
  var index = list.indexOf(v);
  
  return index == -1 ? false : true;
}

// 判断2个节点是不是同一个
function isSameElem(elemA, elemB){
  return elemA.x == elemB.x && elemA.y == elemB.y;
}

// 计算 elem节点，与 end_elem 的 H 估值
function getH(elem){
  var x = elem.x;
  var y = elem.y;
  
  var z = Math.abs( end_elem.x - x ) + Math.abs( end_elem.y - y );
  
  return z * 10;
}

// 通过传入一个节点，得到它周边的节点（排除墙）
// 并设置周边节点对于的G和H，F值
function getElemRound(elem){
  var x = elem.x;
  var y = elem.y;
  var G = elem.G;
  
  var t = [
    [x - 1, y - 1, 14], [x, y - 1, 10], [x + 1, y - 1, 14],
    [x - 1, y, 10], [x + 1, y, 10],
    [x - 1, y + 1, 14], [x, y + 1, 10], [x + 1, y + 1, 14]
  ];
  
  var tf = t.filter(function(v){
    var x = v[0];
    var y = v[1];
    
    return x >= 0 && x < col && 
           y >= 0 && y < row &&
           r[y][x] != 1 &&
           close_list.indexOf( [x, y].join() ) == -1;
  });
  
  var result = tf.map(function(v){
    var x = v[0];
    var y = v[1];
    var g = v[2];
    
    var el = boxDOM[y][x];
    
    // 如果 el 不在 open_list 就设置新的G值，
    // 不然就先不要改变以前的G值
    if( !isInElemFromList(open_list, el) ){
      el.G = G + g;
    }
    el.H = getH(el);
    el.F = el.G + el.H;
    
    return el;
  });
  
  return result;
  
}//end getElemRound

// 根据 curElem的G值 和 aimElem的位置，得到新的 G值是多少
function getElemNewG(curElem, aimElem){
  var cur_G = curElem.G;
  var cur_x = curElem.x;
  var cur_y = curElem.y;
  
  var aim_x = aimElem.x;
  var aim_y = aimElem.y;
  
  if( ( aim_x == cur_x - 1 &&  aim_y == cur_y - 1 )
     || ( aim_x == cur_x + 1 &&  aim_y == cur_y - 1 )
     || ( aim_x == cur_x - 1 &&  aim_y == cur_y + 1 )
     || ( aim_x == cur_x + 1 &&  aim_y == cur_y + 1 ) ){
    return cur_G + 14;
  }else{
    return cur_G + 10;
  }
  
}

//console.log( getElemRound( begin_elem ) );

// 寻到开启列表中F值最低的格子
function findLowerF(){
  
  if( open_list.length == 1 ){
    return getElemFormList(open_list[0]);
  }
  
  //从 小到大 排序
  var result = open_list.sort(function(a, b){
    return getElemFormList(a).F - getElemFormList(b).F;
  });
  
  var rr = [];
  
  result.forEach(function(v){
    rr.push( getElemFormList( v ) );
  })
  
  console.log(rr);
  
  return getElemFormList( result[0] );
}

var letsgoKey = true;
function letsgo( callback ){
  
  if( !letsgoKey || isInElemFromList( close_list, end_elem ) ){
    callback && callback(true);
    return;
  }
  
  // 没有解
  if( open_list.length == 0 ){
    callback && callback(false);
    return;
  }
  
  var curElem = findLowerF();
  
  console.log( curElem )
  
  removeElemFormList(open_list, curElem);
  pushElemIntoList(close_list, curElem);
  
  //  得到周边的值
  var curElemRound = getElemRound(curElem);
  
  // 如果周边没有可走的路
  // 则循环，这取出 open_list 更合适的值
  if( curElemRound.length != 0 ){
  
    //console.log( curElemRound )
    //console.log( close_list )
    //console.log( open_list )
    
    for(var i=0; i<curElemRound.length; i++){
      var round = curElemRound[i];
      
      if( isSameElem(round, end_elem) ){
        end_elem.father = curElem;
        letsgoKey = false;
        break;
      }
      
      //round 不在开启列表
      if( !isInElemFromList(open_list, round) ){
        
        pushElemIntoList(open_list, round);
        round.father = curElem;
      }
      // round 在开启列表
      else{
        // 检查新的G值是否更低
        var old_G = round.G;
        var new_G = getElemNewG(curElem, round);
        
        if( new_G < old_G ){
          round.father = curElem;
          round.G = new_G;
        }
      }
      
    }//end for
  }

  setTimeout(function(){
    letsgo(callback);
  }, 10);
  
  
}//end letsgo

letsgo(function(key){
  if( key ){
    msg.innerHTML = "恭喜你，有解！";
   
    var father = end_elem.father;

    while( father ){
      if( father.className == "A" ){ break; }
      father.innerHTML = "o";
      father = father.father;
    }
  }else{
    msg.innerHTML = "啊哦～无解，请刷新页面再试";
  }
  
});







