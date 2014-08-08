(function() {
    'use strict';
    angular.module('sophe-joint', [])
    .directive('jointCanvas', ['$rootScope',
    function canvasDirective ($rootScope) {
        return {
            restrict: 'A',
            scope: {
                onDrop: '&'
            },
            link: function(scope, element) {
                var graph = new joint.dia.Graph();

                var paper = new joint.dia.Paper({
                  el: element,
                  width: 800,
                  height: 600,
                  gridSize: 1,
                  model: graph
                });

                var erd = joint.shapes.erd;

                var createElement = function(elm, x, y, label) {
                  var cell = new elm({ position: { x: x, y: y }, attrs: { text: { text: label }}});
                  graph.addCell(cell);
                  return cell;
                };

                var link = function(elm1, elm2) {
                  var myLink = new erd.Line({ source: { id: elm1.id }, target: { id: elm2.id }});
                  graph.addCell(myLink);
                  return myLink;
                };

                var employee = createElement(erd.Entity, 100, 200, 'Employee');
                var salesman = createElement(erd.Entity, 100, 400, 'Salesman');
                var wage = createElement(erd.WeakEntity, 530, 200, 'Wage');
                var paid = createElement(erd.IdentifyingRelationship, 350, 190, 'gets paid');
                var isa = createElement(erd.ISA, 125, 300, 'ISA');
                var number = createElement(erd.Key, 0, 90, 'number');
                var nameEl = createElement(erd.Normal, 75, 30, 'name');
                var skills = createElement(erd.Multivalued, 150, 90, 'skills');
                var amount = createElement(erd.Derived, 440, 80, 'amount');
                var date = createElement(erd.Normal, 590, 80, 'date');
                var plate = createElement(erd.Key, 405, 500, 'plate');
                var car = createElement(erd.Entity, 430, 400, 'Company car');
                var uses = createElement(erd.Relationship, 300, 390, 'uses');

                link(employee, paid).cardinality('1');
                link(employee, number);
                link(employee, nameEl);
                link(employee, skills);
                link(employee, isa);
                link(isa, salesman);
                link(salesman, uses).cardinality('0..1');
                link(car, uses).cardinality('1..1');
                link(car, plate);
                link(wage, paid).cardinality('N');
                link(wage, amount);
                link(wage, date);
            }
        };
    }]);
})();