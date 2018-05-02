<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| Route::get('/', function () {
|     return view('welcome');
| });
|
| Route::get('/coin/', '\App\Http\Controllers\Coin\IndexController@index');
*/

Route::get('/coin/home', 'Coin\IndexController@index');

// Auth::routes();
// Authentication Routes...
Route::get('/coin/login', 'Auth\LoginController@showLoginForm')->name('login');
Route::post('/coin/login', 'Auth\LoginController@login');
Route::post('/coin/logout', 'Auth\LoginController@logout')->name('logout');

// Registration Routes...
Route::get('/coin/register', 'Auth\RegisterController@showRegistrationForm')->name('register');
Route::post('/coin/register', 'Auth\RegisterController@register');

// Password Reset Routes...
Route::get('/coin/password/reset', 'Auth\ForgotPasswordController@showLinkRequestForm')->name('password.request');
Route::post('/coin/password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');
Route::get('/coin/password/reset/{token}', 'Auth\ResetPasswordController@showResetForm')->name('password.reset');
Route::post('/coin/password/reset', 'Auth\ResetPasswordController@reset');
