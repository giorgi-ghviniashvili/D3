_force.init = function(render) {
    var accelerateLayout, currentStats, d3force, forceLayout, linkDistance, newStatsBucket, oneRelationshipPerPairOfNodes;
    forceLayout = {};
    linkDistance = 45;
    d3force = d3.layout.force().linkDistance(function(relationship) {
        return relationship.source.radius + relationship.target.radius + linkDistance;
    }).charge(-1000);
    newStatsBucket = function() {
        var bucket;
        bucket = {
            layoutTime: 0,
            layoutSteps: 0
        };
        return bucket;
    };
    currentStats = newStatsBucket();
    forceLayout.collectStats = function() {
        var latestStats;
        latestStats = currentStats;
        currentStats = newStatsBucket();
        return latestStats;
    };
    accelerateLayout = function() {
        var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
        maxStepsPerTick = 100;
        maxAnimationFramesPerSecond = 60;
        maxComputeTime = 1000 / maxAnimationFramesPerSecond;
        now = window.performance && window.performance.now ? function() {
            return window.performance.now();
        } : function() {
            return Date.now();
        };
        d3Tick = d3force.tick;
        return d3force.tick = function() {
            var startCalcs, startTick, step;
            startTick = now();
            step = maxStepsPerTick;
            while (step-- && now() - startTick < maxComputeTime) {
                startCalcs = now();
                currentStats.layoutSteps++;
                neo.collision.avoidOverlap(d3force.nodes());
                if (d3Tick()) {
                    maxStepsPerTick = 2;
                    return true;
                }
                currentStats.layoutTime += now() - startCalcs;
            }
            render();
            return false;
        };
    };
    accelerateLayout();
    oneRelationshipPerPairOfNodes = function(graph) {
        var i, len, pair, ref, results;
        ref = graph.groupedRelationships();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            pair = ref[i];
            results.push(pair.relationships[0]);
        }
        return results;
    };
    forceLayout.update = function(graph, size) {
        var center, nodes, radius, relationships;
        nodes = neo.utils.cloneArray(graph.nodes());
        relationships = oneRelationshipPerPairOfNodes(graph);
        radius = nodes.length * linkDistance / (Math.PI * 2);
        center = {
            x: size[0] / 2,
            y: size[1] / 2
        };
        neo.utils.circularLayout(nodes, center, radius);
        return d3force.nodes(nodes).links(relationships).size(size).start();
    };
    forceLayout.drag = d3force.drag;
    return forceLayout;
};