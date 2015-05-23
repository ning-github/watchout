// start slingin' some d3 here.

var boardWidth = 500;
var boardHeight = 500;
var nEnemies = 15;
var enemyData = [];

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

var enemies = gameBoard.selectAll('circle')
  .data(enemyData);

enemies.enter().append('svg:circle')
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; })
  .attr('r', 6)
  .attr('fill', 'red');

/*------------------------------------------------*/
debugger;

for( var i = 0; i < enemyData.length; i++ ){
  var eachEnemy = enemyData[i];
  for( var key in eachEnemy ) {
    eachEnemy[key] = Math.random() * 500;
  }
}

gameBoard.selectAll('circle')
  .data(enemyData, function(d){return d;}).transition().duration(2000);


