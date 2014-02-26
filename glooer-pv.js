angular.module( 'Glooer.pv', [ 'Glooer' ] )

.factory( 'GlooerPVImpl', function()
{
	return function( $scope )
	{
		$scope.percentage = function( total, x )
		{
			return ( ( ( total > 0 ) && ( x > 0 ) ) ? ( ( x * 100 ) / total ) : 0.00 );
		};

		// pv == percentage value
		// is very specific so works kinda different from cv()
		$scope.pv = function( _new_path, _total_path, _x_path )
		{
			var gp = $scope.get_path;
			var values = $scope.values;
			var fe = angular.forEach;

			var new_path = gp( _new_path );
			var total_path = gp( _total_path );
			var x_path = gp( _x_path );

			$scope.setup_value( new_path );

			var total_src = values;
			var x_src = values;

			fe( total_path, function( part )
			{
				total_src = total_src[ part ];
			} );

			fe( x_path, function( part )
			{
				x_src = x_src[ part ];
			} );

			var dst = $scope.sources;

			var new_dest_key = new_path.pop();

			fe( new_path, function( part )
			{
				dst = dst[ part ];
			} );

			new_path.push( new_dest_key );

			var p = $scope.percentage;

			var sv = function()
			{
				var value = p( total_src._, x_src._ );

				dst[ new_dest_key ] = value;

				return value;
			};

			fe( [ total_path, x_path ], function( path )
			{
				$scope.$watch( 'values.' + path.join( '.' ) + '._', function()
				{
					sv();
				} );
			} );

			$scope.make_watcher( new_path )( sv() );
		};
	};
} )

;

