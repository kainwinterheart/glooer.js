(function(){

'use strict';

angular.module( 'Glooer', [] )

.controller( 'GlooerController', function( $scope )
{
	/* id1 => {
		id2 => {
			idN => {
				'_' => 100500 // {{id1.id2.idN._}}
			},
			'_' => 100500 // {{id1.id2._}}
		},
		'_' => 100500 // {{id1._}}
	} */
	$scope.values = {}; // results are here

	$scope.sources = {}; // direct access to data sources

	// iv == init value
	$scope.iv = function( _path, value )
	{
		var path = undefined;

		if( angular.isArray( _path ) )
		{
			path = angular.copy( _path );

		} else
		{
			path = _path.split( /\./ );
		}

		$scope.setup_value( path );

		if( arguments.length == 1 )
		{
			value = $scope.default_value;
		}

		var dest_key = path.pop();
		var dst = $scope.sources;

		angular.forEach( path, function( part )
		{
			dst = dst[ part ];
		} );

		dst[ dest_key ] = value;
	};

	// creates pathes and initializes watchers
	$scope.setup_value = function( _path )
	{
		var path = angular.copy( _path );
		var dest_key = path.pop();

		var sources = $scope.sources;
		var values = $scope.values;

		angular.forEach( path, function( part )
		{
			if( ! sources.hasOwnProperty( part ) ) sources[ part ] = {};
			if( ! values.hasOwnProperty( part ) ) values[ part ] = {};

			sources = sources[ part ];
			values = values[ part ];
		} );

		values[ dest_key ] = {};

		path.push( dest_key );

		var sv = $scope.set_value;
		var cv = $scope.calc_value;

		// this watcher is kinda slow and probably needs to be rewritten
		$scope.$watch( 'sources.' + path.join( '.' ), function( new_value )
		{
			sv( path, new_value );

			var new_path = angular.copy( path );
			var l = new_path.length;

			for( var i = 0; i < l; ++i )
			{
				new_path.pop();

				sv( new_path, cv( new_path ) );
			}
		} );
	};

	// calculates value for path
	$scope.calc_value = function( path, src )
	{
		if( ! angular.isDefined( src ) ) src = $scope.sources;

		var out = $scope.default_value;

		angular.forEach( path, function( part )
		{
			src = src[ part ];
		} );

		if( angular.isObject( src ) )
		{
			var r = $scope.reduce;

			angular.forEach( src, function( value, key )
			{
				out = r( out, $scope.calc_value( [ key ], src ) );
			} );

		} else
		{
			out = $scope.parse_input( src );
		}

		return out;
	};

	// sets resulting value for path
	$scope.set_value = function( path, value )
	{
		var dst = $scope.values;

		angular.forEach( path, function( part )
		{
			dst = dst[ part ];
		} );

		dst._ = value;
	};

	// parses input
	$scope.parse_input = function( value )
	{
		return ( parseFloat( value ) || $scope.default_value );
	};

	// default value
	$scope.default_value = 0.00;

	$scope.reduce = function( a, b )
	{
		return a + b;
	};
} )

;

})();

