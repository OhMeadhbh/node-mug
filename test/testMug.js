var mug = require('../node-mug');
var assert = require('assert');

exports.testBasic = function ( beforeExit ) {
    var uuids = [];

    var generatorCallback = function ( uuid ) {
        // this will totally break if we move to a threaded model. 
        // i.e. - this is not thread safe
        uuids.push( uuid );
    };

    var createCallback = function( g ) {
        // generate 10 UUID objects
        for( i = 0; i < 10; i++ ) {
            g.generate( generatorCallback );
        }
    };

    mug.createInstance( createCallback );

    beforeExit( function () {
            for( var i = 0; i < uuids.length; i++ ) {
                var uuid = uuids[i];
                assert.isDefined( uuid );
                assert.type( uuid, 'object' );
                assert.type( uuid.toString(), 'string' );
            }
    });
};

// this is a copy of the last function, only we're using a file with
// "predefined entropy" - which is a funny concept when you think about it.
// this is to test the feature of using non-standard entropy sources.

exports.testWithFile = function ( beforeExit ) {
    var uuids = {};

    var uuidFixtures = [
        'e0244b5c-41dc-45fa-a114-40c95d72eba7',
        'b4e5d92a-9216-4afa-b862-b3f156af8804',
        'f39f1baa-8633-44b6-a891-80799f002f79',
        'c9d0c50a-d25b-41f9-8545-b5f60d2b9a66',
        'cbfc2c18-2aa9-49f2-bb8b-16cd2980b1da',
        '57b0a436-65f2-4f82-a0a1-d70ae46281bb',
        '426a2b4a-6a8b-4390-8293-c9ebc4fae846',
        '902beed8-ebe9-4f65-bfa5-2906cdf6c89c',
        'bc272954-0ec3-4cb6-b7f6-ea1691783361',
        'dd270ec1-91dc-467e-a6fc-e1e71ec2ba8c'
    ];

    var generatorCallback = function ( uuid ) {
        var key = uuid.toString();
        uuids[ key ] = uuid;
    };

    var createCallback = function( g ) {
        // generate 10 UUID objects
        for( i = 0; i < 10; i++ ) {
            g.generate( generatorCallback );
        }
    };

    mug.createInstance( {source:'./entropy.bin'}, createCallback );

    beforeExit( function () {
            for( var i = 0; i < uuidFixtures.length; i++ ) {
                var key = uuidFixtures[i];
                assert.equal( uuids[ key ].toString(), key );
            }
    });
};

exports.testNull = function ( beforeExit ) {
    var nullUUID = mug.NullUUID;

    assert.equal( "00000000-0000-0000-0000-000000000000", nullUUID.toString() );
};