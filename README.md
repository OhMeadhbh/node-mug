# node-mug (Meadhbh's UUID Generator)

This package generates time-based, MD5-based, SHA1-based or cryptographically
random RFC 4122 compliant UUIDs.

## Installation

The easiest way to install this package is to use npm:

<pre>    npm install node-mug</pre>

If you want to check out the source, use the git command:

<pre>    git clone git://github.com/OhMeadhbh/node-mug.git</pre>

## Usage

### Initialization

After importing the node-mug package, create a UUID generator with the 
createInstance() function. By default, node-mug will generate version 4
(randomly generated) UUIDs.

<pre>    var mug = require( 'node-mug' );
    var UUIDGenerator;

    mug.createInstance( function ( g ) {
        UUIDGenerator = g;
    } );</pre>

### Generating Random (Version 4) UUIDs

Once you have a generator, call the generate() function with a callback to
generate UUIDs. The single parameter to the callback will be a UUID object
that includes toString() and toURN():

<pre>    UUIDGenerator.generate( function ( uuid ) {
        console.log( uuid.toString() );
        console.log( uuid.toURN() );
     });</pre>

The generate() call will usually allocate a new buffer to hold the UUID. If you
want to use a pre-allocated buffer, you can pass it as the third parameter
to the generate() call. UUID buffers must be at least 16 octets.

<pre>    var uuidBuffer = new Buffer( 16 );

    V4Generator.generate( function ( uuid ) {
        console.log( uuid.toString() );
        console.log( uuid.toURN() );
     }, null, uuidBuffer );</pre>

So, putting it all together, here's a program that generates 10 random UUIDs:

<pre>    var mug = require('node-mug');

    var generatorCallback = function ( uuid ) {
        console.log( uuid.toString() );
    };

    var createCallback = function( g ) {
        for( i = 0; i &lt; 10; i++ ) {
            g.generate( generatorCallback );
        }
    };

    mug.createInstance( createCallback );</pre>

#### Using an Alternate Entropy Source with Version 4 (Random) UUID Generators

By default, this package will read entropy from /dev/random. This device will
block if there is insufficient entropy in the entropy pool. This is done to
ensure the package is "secure by default."

Ensuring the system has sufficient entropy can be difficult in some situations.
However, many developers find that the output of /dev/urandom (which does not
block) is suitably unpredictable.

If you want to use a file other than /dev/random, pass an options object as
the first parameter to the createInstance call:

<pre>    var mug = require('node-mug');
    var V4Generator;

    mug.createInstance( {source: '/dev/urandom', version: mug.RANDOM}, function ( g ) {
        V4Generator = g;
    } );</pre>

Note that the version element of the options object is optional. The
createInstance() function creates a RANDOM uuid generator by default. Still,
it is good practice to explicitly set this option as defaults may change
in the future and it better expresses the programmer's intent.

#### Creating Version 3 or 5 (Name Based) UUID Generators

To create a generator that generates name based uuids, pass in an options
object with a version element set to mug.MD5 or mug.SHA1:

<pre>    //This creates a MD5 name based uuid generator
    var mug = require( 'node-mug' );
    var V3Generator;
    
    function V3createCallback ( g ) {
        V3Generator = g;
    };
    
    mug.createInstance( {version: mug.MD5}, V3createCallback );</pre>
    
And here's an example of creating a SHA1 name based UUID generator:

<pre>    //This creates a SHA1 name based uuid generator
    var mug = require( 'node-mug' );
    var V5Generator;
    
    function V5createCallback ( g ) {
        V5Generator = g;
    };
    
    mug.createInstance( {version: mug.SHA1}, V5createCallback );</pre>

### Generating Name Based (Version 3 or 5) UUIDs

Generating name based UUIDs is similar to creating random UUIDs. The primary
difference is you add a "name" parameter to the generate() call. The name
is hashed and used to generate the UUID.

This example will output two SHA1 name-based UUIDs. The second call uses a
pre-allocated buffer:

<pre>    var mug = require('node-mug');
    var uuidBuffer = new Buffer( 16 );
    
    function generatorCallback ( uuid ) {
        console.log( uuid.toString() );
    }
    
    function createCallback ( generator ) {
        generator.generate( generatorCallback, "example 1" );
        generator.generate( generatorCallback, "example 2", uuidBuffer );
    }
    
    mug.createInstance( {version: mug.MD5}, createCallback );</pre>

#### Creating a Version 1 (Time & MAC Address Based) UUID Generator

To create a generator that generates time based uuids, pass in an options
object with a version element set to mug.TIME:

<pre>    //This creates a time name based uuid generator
    var mug = require( 'node-mug' );
    var V1Generator;
    
    function V1createCallback ( g ) {
        V1Generator = g;
    };
    
    mug.createInstance( {version: mug.TIME}, V1createCallback );</pre>

### Generating Time Based (Version 1) UUIDs

Generating time based UUIDs uses the same pattern as random or name-based
UUIDs. After creating the generator, call the generator() function passing
in a callback function; the newly generated UUID will be passed as a parameter
to the callback.

This example will output three time-based UUIDs.

<pre>    var mug = require('node-mug');
    
    function generatorCallback ( uuid ) {
        console.log( uuid.toString() );
    }
    
    function createCallback ( generator ) {
        generator.generate( generatorCallback );
        generator.generate( generatorCallback );
        generator.generate( generatorCallback );
    }
    
    mug.createInstance( {version: mug.TIME}, createCallback );</pre>

### The NullUUID Object

A special UUID object representing the null UUID is exported by the node-mug
package as NullUUID. The following example demonstrates its use:

<pre>    var mug = require('node-mug');

    console.log( mug.NullUUID.toString() );</pre>

### Cleaning Up

You *SHOULD* call the close() function on UUID generator objects when you're
done with them:

<pre>    V4Generator.close();</pre>

## Testing

There is an expresso-based test and a non expresso based test. Before
running either, cd into the test directory. For the expresso test, use
the command:

<pre>    expresso testMug.js</pre>

For the non-expresso test, use this command:

<pre>    node test/nonExpressoTest.js</pre>
