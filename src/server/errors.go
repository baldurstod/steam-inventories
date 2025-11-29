package main

import "errors"

type NotFoundError struct{}

func (e NotFoundError) Error() string {
	return "Not found"
}

type ApiErrorCode int

const (
	UnexpectedError = iota
	NoParamsError
	InvalidParamSteamId
	InvalidParamAppId
	InvalidParamContextId
)

var apiErrorValues = map[ApiErrorCode]error{
	UnexpectedError:       errors.New("unexpected error, contact support"),
	NoParamsError:         errors.New("no params provided"),
	InvalidParamSteamId:   errors.New("invalid param steam id"),
	InvalidParamAppId:     errors.New("invalid param app id"),
	InvalidParamContextId: errors.New("invalid param context id"),
}

type apiError interface {
	Error() string
	isApiError() bool
}

type apiError2 struct {
	StatusCode int
	Err        error
}

func (e apiError2) Error() string {
	return e.Err.Error()
}

func (e apiError2) isApiError() bool {
	return true
}

func CreateApiError(c ApiErrorCode) apiError2 {
	e := apiErrorValues[c]
	return apiError2{Err: e}
}
