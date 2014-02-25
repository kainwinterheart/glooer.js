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
		var path = $scope.get_path( _path );

		$scope.setup_value( path );

		if( arguments.length == 1 )
		{
			value = $scope.default_value;
		}

		var w = $scope.make_watcher( path );
		var dest_key = path.pop();
		var dst = $scope.sources;

		angular.forEach( path, function( part )
		{
			dst = dst[ part ];
		} );

		dst[ dest_key ] = value;

		w( value ); // can't wait for real watcher here
	};

	// cv == complex value
	// initializes handlers and stuff for values which are results of reducing some old values
	$scope.cv = function( _new_path, _present_pathes )
	{
		var gp = $scope.get_path;
		var sv = $scope.setup_value;
		var sources = $scope.sources;
		var values = $scope.values;

		var new_path = gp( _new_path );
		var present_pathes = [];

		angular.forEach( _present_pathes, function( value )
		{
			var present_path = gp( value );
			var present_path_str = present_path.join( '_' );

			var special_path = angular.copy( new_path );

			special_path.push( present_path_str );

			sv( special_path );

			var w = $scope.make_watcher( angular.copy( special_path ) );

			special_path.pop();

			var dst = sources;

			angular.forEach( special_path, function( part )
			{
				dst = dst[ part ];
			} );

			var src = values;

			angular.forEach( present_path, function( part )
			{
				src = src[ part ];
			} );

			var present_path_value = src._;

			dst[ present_path_str ] = present_path_value;

			w( present_path_value ); // I suppose I also can't wait for real watcher here

			$scope.$watch( 'values.' + present_path.join( '.' ) + '._', function( new_value )
			{
				dst[ present_path_str ] = new_value;

//				w( new_value ); // is not necessary here
			} );
		} );

	};

	$scope.get_path = function( value )
	{
		var path = undefined;

		if( angular.isArray( value ) )
		{
			path = angular.copy( value );

		} else
		{
			path = value.split( /\./ );
		}

		return path;
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

		$scope.$watch( 'sources.' + path.join( '.' ), $scope.make_watcher( path ) );
	};

	$scope.make_watcher = function( path )
	{
		var sv = $scope.set_value;
		var cv = $scope.calc_value;
		var c = angular.copy;

		// this watcher is kinda slow and probably needs to be rewritten
		return function( new_value )
		{
			sv( path, new_value );

			var new_path = c( path );
			var l = new_path.length;

			for( var i = 0; i < l; ++i )
			{
				new_path.pop();

				sv( new_path, cv( new_path ) );
			}
		};
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

