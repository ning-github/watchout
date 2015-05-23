// start slingin' some d3 here.

var boardWidth = 500;
var boardHeight = 500;
var nEnemies = 3;
var enemyData = [];
var playerRadius = 20;

var collisionCount = 0;

//scores
var highScore = 0;
var currentScore = 0;

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
  .transition().tween('firstTransition', function() {
    d3.select('.high').selectAll('span')
      .data([highScore])
      .text(function(d) {return d;});
    d3.select('.current').selectAll('span')
      .data([currentScore])
      .text(function(d) {return d;});
    d3.select('.collisions').selectAll('span')
      .data([collisionCount])
      .text(function(d) {return d;});
  })
  .attr('class','enemy')
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; })
  .attr('r', 6)
  .attr('fill', 'red')
  .attr('collided', false);


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
  .data([onlyPlayer]);

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

var checkCollision = function(enemy, collidedCallback){
  currentScore++;
  var radiusSum = parseFloat(enemy.attr('r')) + parseFloat(player.attr('r'));
  var xDiff = parseFloat(enemy.attr('cx')) - parseFloat(player.attr('cx'));
  var yDiff = parseFloat(enemy.attr('cy')) - parseFloat(player.attr('cy'));

  var col = enemy.attr('collided') === 'false' ? false : true; //parse bool
  //pythag therom to check the distance between the centers of two circles
  var separation = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff, 2));

  if (separation < radiusSum) {
    enemy.attr('collided', true);
  } else {
    if (enemy.attr('collided') === 'true') {
      if (currentScore > highScore){
        highScore = currentScore;
        currentScore = 0;
      }
      collisionCount++;
    }
    enemy.attr('collided', false);
  }
}

var tweenWithCollisionDetection = function(){
  var enemy = d3.select(this);
  // creates another function to preserve access to enemy's this binding by closure
  //  to ensure you are checking the right enemy

  return function() {
    d3.select('.high').selectAll('span')
      .data([highScore])
      .text(function(d) {return d;});
    d3.select('.current').selectAll('span')
      .data([currentScore])
      .text(function(d) {return d;});
    d3.select('.collisions').selectAll('span')
      .data([collisionCount])
      .text(function(d) {return d;});
    checkCollision(enemy);
  }

}

