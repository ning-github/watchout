// start slingin' some d3 here.

var boardWidth = 500;
var boardHeight = 500;
var nEnemies = 1;
var enemyData = [];
var playerRadius = 20;
var collisionCount = 0;

var gameBoard = d3.select('body').append('svg:svg')
  .attr('class', 'gameBoard')
  .attr('width', boardWidth)
  .attr('height', boardHeight);

var generateEnemyPositions = function() {
  var x = Math.random() * boardWidth;
  var y = Math.random() * boardHeight;
  return {'x': x, 'y': y};
};

var generateEnemies = function(array) {
  for( var i = 0; i < nEnemies; i++ ) {
    array[i] = (generateEnemyPositions());
  }
};

generateEnemies(enemyData);

var enemies = gameBoard.selectAll('circle.enemy')
  .data(enemyData);

enemies.enter().append('svg:circle')
  .attr('class','enemy')
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; })
  .attr('r', 6)
  .attr('fill', 'red');


/* player's dot */
/*------------------------------------------------*/
var onlyPlayer = {x:250, y:250};
var dragmove = function(d){
  d3.select(this)
  .attr("cx", d.x = Math.max(playerRadius, Math.min(boardWidth - playerRadius, d3.event.x)))
  .attr("cy", d.y = Math.max(playerRadius, Math.min(boardHeight - playerRadius, d3.event.y)));
};

var drag = d3.behavior.drag()
  .origin(function(d){return d;})
  .on('drag', dragmove);

var player = gameBoard.selectAll('circle.player')
  .data([onlyPlayer])
  .call(drag);

player.enter().append('svg:circle')
  .attr('class','player')
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; })
  .attr('r', playerRadius)
  .attr('fill', 'white');

player.call(drag);

/* random movement */
/*------------------------------------------------*/

var moveOnce = function(eachEnemy){
  for( var key in eachEnemy ) {
    eachEnemy[key] = Math.random() * 500;
  }
  return eachEnemy;
}

for (var j = 0; j < enemyData.length; j++){
  moveOnce(enemyData[j]);
}

gameBoard.selectAll('circle.enemy')
  .data(enemyData).transition().duration(1000)
  .attr('cx', function(d) { return d.x; })  // NEED to reset DOM node coords
  .attr('cy', function(d) { return d.y; });   // so that the DOM can REFLECT its new coords and not just have them set

var moving = function(){
  return function(){
    for (var j = 0; j < enemyData.length; j++){
      moveOnce(enemyData[j]);
    }
    gameBoard.selectAll('circle.enemy')
      .data(enemyData).transition().duration(1000)
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; })
      .tween('custom', tweenWithCollisionDetection);
    d3.timer(moving(), 1000);
    return true;
  }
}
d3.timer(moving(), 1000);

/* collision detection */
/*------------------------------------------------*/
var onCollision = function() {
  console.log("collided!");
  collisionCount++;
  // updateBestScore();
  // updateScore();
  // set current score to zero
};

var checkCollision = function(enemy, collidedCallback, already){
  var radiusSum = parseFloat(enemy.attr('r')) + parseFloat(player.attr('r'));
  var xDiff = parseFloat(enemy.attr('cx')) - parseFloat(player.attr('cx'));
  var yDiff = parseFloat(enemy.attr('cy')) - parseFloat(player.attr('cy'));

  //pythag therom to check the distance between the centers of two circles
  var separation = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff, 2));
  console.log(separation);
  if (separation < radiusSum && !already) {
    already = true;
    console.log('collisions: ', collisionCount);
    collidedCallback(player, enemy);
  }
}

var tweenWithCollisionDetection = function(){
  var enemy = d3.select(this);

  // creates another function to preserve access to enemy's this binding by closure
  //  to ensure you are checking the right enemy
  return function(){
    var already = false;
    checkCollision(enemy, onCollision, already);
  }
}

gameBoard.selectAll('circle.enemy')
  .data(enemyData).transition().duration(1000) //binding selected DOM nodes with updated version of data
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; })
  .tween('custom', tweenWithCollisionDetection);



