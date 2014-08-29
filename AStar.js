/*=====================================================================
  A* 算法
  
  Author      paper
  Date        2014-08
  Site        https://github.com/paper
  
  Reference   http://www.policyalmanac.org/games/aStarTutorial.htm
========================================================================*/

// 地图容器 和 提示消息
var box = document.getElementById("box");
var msg = document.getElementById("msg");

// 地图数据
var map = [];

/*
  可编辑的行列
  
  这里和canvas的坐标系相反
  行 - 对应的是 x 轴
  列 - 对应的是 y 轴
  
  也就是说，以左上角为（0，0）原点，
  x 轴是垂直向下的，表示有多少行，
  y 抽是水平向右的，表示有多少列
*/
var row = 25; // 行
var col = 30; // 列

// 所有节点
var nodes = [];

// 每个节点的宽度，高度，节点之间的间隙
var width = 20;
var height = 20;
var space = 1;

// 开始节点，结束节点
var startNode = null;
var endNode = null;

// letsgo函数 判断是否继续循环的key
// 如果为false 就不再循环
var letsgoKey = true;

// 开启列表, 存入坐标的join值 
// example: [ "3,4", "10,20" ]
var openList = [];

// 关闭列表, 存入坐标的join值，同上
var closeList = [];

// 初始化地图基本数据
// 主要是确定哪些节点是障碍物，哪些不是
function initMapData(){
  
  var x = 0,
      y = 0,
      p = 0.7, // 不是障碍物的概率
      result = [],
      temp = null;
  
  for(x = 0; x < row; x++){
    temp = [];
    
    for(y = 0; y < col; y++){
      
      // 其实可以设置0.5 ，这样障碍物和空格的概率一样，但是这样会出现比较多的死胡同
      // 所以为了看效果，设置稍微较大的值
      // 0: 可以“行走”的空格, 1: 障碍物
      Math.random() < p ? temp.push(0) : temp.push(1);
    }
    
    result.push(temp);
  }
  
  return result;
  
}//end initMapData

function createMap(){

  box.style.display = "none";
  
  var x = 0,
      y = 0,
      node = null,
      
      rowData = null,
      nodesTemp = null;
  
  for(x = 0; x < row; x++){
    rowData = map[x];
    nodesTemp = [];

    for(y = 0; y < col; y++ ){
      node = document.createElement("span");
      
      if(rowData[y] == 1 ){
        node.className = "block";
      }
      
      node.style.left = (width  + space) * y + "px";
      node.style.top  = (height + space) * x + "px";
      
      // 节点初始化
      node.x = x;
      node.y = y;
      node.G = 0;
      node.H = 0;
      node.F = 0;
      
      box.appendChild(node);
      nodesTemp.push(node);
    }
    
    nodes.push(nodesTemp);
  }
  
  box.style.display = "block";
  
}//end createMap

// 创建随机的 开始 和 结束 节点
// A: 开始节点， B: 结束节点
function createAB(){
  var A = true,
      B = true;
  
  while(A){
    var x = parseInt( Math.random() * row, 10),
        y = parseInt( Math.random() * col, 10);
    
    if( map[x][y] == 0 ){
      A = false;
      
      nodes[x][y].className = "A";
      // 文字改成在css里面定义了
      // nodes[x][y].innerHTML = "起";
      startNode = nodes[x][y];
    }
    
  }
  
  while(B){
    var x = parseInt( Math.random() * row, 10),
        y = parseInt( Math.random() * col, 10);
    
    if( map[x][y] == 0 && nodes[x][y].className != "A" ){
      B = false;
      
      nodes[x][y].className = "B";
      //nodes[x][y].innerHTML = "终";
      endNode = nodes[x][y];
    }
    
  }
  
}//end createAB

// 把节点 node 转化成字符串 item 放入 list
function pushNode(list, node){
  var item = [node.x, node.y].join();
  
  list.push( item );
}

// 根据 list 里面的某个元素 item ，得到对应的 节点 
function getNode(item){
  var r = item.split(","),
      x = r[0],
      y = r[1];
  
  return nodes[x][y];
}

// 从 list 里面移除某个 节点 对应的 字符串 item
function removeNode(list, node){
  var item = [node.x, node.y].join();
  var index = list.indexOf(item);
  
  if( index != -1 ){
    list.splice(index, 1);
    return true;
  }else{
    return false;
  }
}

// 判断某个节点，是不是 在 某个 list 里面 
function isIn(list, node){
  var item = [node.x, node.y].join();
  var index = list.indexOf(item);
  
  return index != -1;
}

// 判断2个节点是不是同一个
function isSameNode(nodeA, nodeB){
  return nodeA.x == nodeB.x && nodeA.y == nodeB.y;
}

// 计算 某个节点，与 endNode 的 H 估值
function getH(node){
  var h = Math.abs( endNode.x - node.x ) + Math.abs( endNode.y - node.y );
  return h * 10;
}

// 判断周边的某个点（x，y），和 节点，组成的4节点矩形，另外一条斜线不是障碍物
// 如果不是障碍物返回true，反之返回false
function checkPass(x, y, round_x, round_y){
  //左上
  if( round_x < x && round_y < y ){
    if( map[x-1][y] == 1 && map[x][y-1] == 1 ) return false;
  }
  
  //右上
  if( round_x < x && round_y > y ){
    if( map[x-1][y] == 1 && map[x][y+1] == 1 ) return false;
  }
  
  //左下
  if( round_x > x && round_y < y ){
    if( map[x+1][y] == 1 && map[x][y-1] == 1 ) return false;
  }
  
  //右下
  if( round_x > x && round_y > y ){
    if( map[x][y+1] == 1 && map[x+1][y] == 1 ) return false;
  }

  return true;
}

// 已知一个节点，得到它周边的节点（排除障碍物和closeList等）
// 并设置周边节点对于的G(如果可以设置)和H，F值
function getNodeRound(node){
  var x = node.x,
      y = node.y,
      G = node.G;
  
  var round = [
    [x - 1, y - 1, 14], [x-1,   y, 10], [x - 1, y + 1, 14],
    [x,     y - 1, 10],                 [x,     y + 1, 10],
    [x + 1, y - 1, 14], [x + 1, y, 10], [x + 1, y + 1, 14]
  ];
  
  var roundOk = round.filter(function(v){
    var round_x = v[0];
    var round_y = v[1];

    // && 运算时，复杂的计算放后面，这样有助于效率
    return round_x >= 0 && round_x < row &&
           round_y >= 0 && round_y < col &&
           map[round_x][round_y] != 1 &&
           closeList.indexOf( [round_x, round_y].join() ) == -1 &&
           checkPass(x, y, round_x, round_y)
  });
  
  var result = roundOk.map(function(v){
    var x = v[0];
    var y = v[1];
    var g = v[2];
    
    var node = nodes[x][y];
    
    // 如果 node 不在 openList 就设置新的G值，
    // 不然就先不要改变以前的G值
    if( !isIn(openList, node) ){
      node.G = G + g;
    }
    
    // 每个节点的H值是不变的，如果没有设置过H值，就设置它
    if( node.H == 0 ){
      node.H = getH(node);
    }
    
    node.F = node.G + node.H;
    
    return node;
  });
  
  return result;
  
}//end getNodeRound

// 根据当前节点curNode的G值和目标节点aimNode的位置
// 得到aimNode节点新的G值是多少
function getNodeNewG(curNode, aimNode){
  var cur_x = curNode.x,
      cur_y = curNode.y,
      cur_G = curNode.G,
      
      aim_x = aimNode.x,
      aim_y = aimNode.y;
  
  if( ( aim_x == cur_x - 1 &&  aim_y == cur_y - 1 )       //左上
     || ( aim_x == cur_x - 1 &&  aim_y == cur_y + 1 )     //右上
     || ( aim_x == cur_x + 1 &&  aim_y == cur_y - 1 )     //左下
     || ( aim_x == cur_x + 1 &&  aim_y == cur_y + 1 ) ){  //右下
    return cur_G + 14;
  }else{
    return cur_G + 10; // 上下左右
  }
  
}//end getNodeNewG

// 寻到开启列表中F值最低的格子
function findLowestF(){
  
  if( openList.length == 1 ){
    return getNode(openList[0]);
  }
  
  //从 小到大 排序
  var result = openList.sort(function(a, b){
    return getNode(a).F - getNode(b).F;
  });
  
  return getNode( result[0] );
}

// let's go :D
function letsgo( callback ){
  
  if( !letsgoKey || isIn( closeList, endNode ) ){
    callback && callback(true);
    return;
  }
  
  // 没有解
  if( openList.length == 0 ){
    callback && callback(false);
    return;
  }
  
  var curNode = findLowestF();
  
  removeNode(openList, curNode);
  pushNode(closeList, curNode);
  
  // 得到当前节点的周边的可用节点
  var curNodeRound = getNodeRound(curNode);
  
  // 如果周边没有可走的路
  // 则循环取出 openList 更合适的值
  if( curNodeRound.length != 0 ){
    
    for(var i=0, len = curNodeRound.length; i < len; i++){
      var round = curNodeRound[i];
      
      if( isSameNode(round, endNode) ){
        endNode.father = curNode;
        letsgoKey = false;
        break;
      }
      
      //round 不在开启列表
      if( !isIn(openList, round) ){
        pushNode(openList, round);
        round.father = curNode;
      }else{
        // 检查新的G值是否更低
        var old_G = round.G;
        var new_G = getNodeNewG(curNode, round);
        
        if( new_G < old_G ){
          round.father = curNode;
          round.G = new_G;
        }
      }
      
    }//end for
  }
  
  // 延迟循环，防止浏览器假死
  setTimeout(function(){
    letsgo(callback);
  }, 10);
  
}//end letsgo

function showOKMsg(){
  msg.innerHTML = "恭喜你 , 找到路了！";
  msg.className = "ok";
}

function showErrorMsg(){
  msg.innerHTML = "我擦！走不过去 :(  请刷新页面再试";
  msg.className = "error";
}

/*------------------------ Run ------------------------*/

map = initMapData();
createMap();
createAB();

// 先初始化开始节点
pushNode(openList, startNode);

letsgo(function(isOk){

  if( isOk ){
    showOKMsg();
   
    var father = endNode.father;

    while( father ){
      if( father.className == "A" ){ break; }
      father.innerHTML = "o";
      father = father.father;
    }
  }else{
    showErrorMsg();
  }
  
});


