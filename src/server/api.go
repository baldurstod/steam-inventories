package main

import (
	"encoding/gob"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"runtime/debug"
	"time"

	"strconv"

	"github.com/gin-gonic/gin"
)

var _ = registerToken()

func registerToken() bool {
	gob.Register(map[string]any{})
	gob.Register(map[string]bool{})
	gob.Register(struct{}{})
	return true
}

type apiRequest struct {
	Action  string         `json:"action" binding:"required"`
	Version int            `json:"version" binding:"required"`
	Params  map[string]any `json:"params"`
}

func apiHandler(c *gin.Context) {
	var request apiRequest
	var err error

	defer func() {
		if err := recover(); err != nil {
			jsonError(c, CreateApiError(UnexpectedError))
			log.Println(err, string(debug.Stack()))
		}
	}()

	if err = c.ShouldBindJSON(&request); err != nil {
		logError(c, err)
		jsonError(c, errors.New("bad request"))
		return
	}

	var apiError apiError
	switch request.Action {
	case "get-inventory":
		apiError = apiGetInventory(c, request.Params)
	default:
		jsonError(c, NotFoundError{})
		return
	}

	if apiError != nil {
		jsonError(c, apiError)
	}
}

func apiGetInventory(c *gin.Context, params map[string]any) apiError {
	steamId64, ok := params["steam_id64"].(string)
	if !ok {
		return CreateApiError(InvalidParamSteamId)
	}

	appId, ok := params["app_id"].(float64)
	if !ok {
		return CreateApiError(InvalidParamAppId)
	}

	contextId, ok := params["context_id"].(float64)
	if !ok {
		return CreateApiError(InvalidParamContextId)
	}

	keepGoing := true
	startAsset := ""
	allAssets := []map[string]any{}
	allDescriptions := []map[string]any{}
	totalInventoryCount := 0
	for keepGoing {
		result, resp, err := getInventory(steamId64, int(appId), int(contextId), startAsset)
		if err != nil {
			return CreateApiError(UnexpectedError)
		}

		success, ok := result["success"].(float64)
		if !ok || success != 1 {
			log.Println(resp)
			return CreateApiError(UnexpectedError)
		}

		count, ok := result["total_inventory_count"].(float64)
		if ok {
			totalInventoryCount = int(count)
		}

		startAsset, ok = result["last_assetid"].(string)
		if !ok {
			keepGoing = false
		}

		assets := result["assets"].([]any)
		for _, asset := range assets {
			allAssets = append(allAssets, asset.(map[string]any))
		}

		descriptions := result["descriptions"].([]any)
		for _, description := range descriptions {
			allDescriptions = append(allDescriptions, description.(map[string]any))
		}

		if keepGoing {
			time.Sleep(5 * time.Second)
		}

		//allAssets = slices.Concat(allAssets, assets)
	}

	jsonSuccess(c, map[string]any{"assets": allAssets, "descriptions": allDescriptions, "total_inventory_count": totalInventoryCount})
	return nil
}

func getInventory(steamId64 string, appId int, contextId int, startAsset string) (map[string]any, *http.Response, error) {

	url := "https://steamcommunity.com/inventory/" + steamId64 + "/" + strconv.Itoa(int(appId)) + "/" + strconv.Itoa(int(contextId)) + "?l=english&count=2000"

	if startAsset != "" {
		url += "&start_assetid=" + startAsset
	}
	log.Println(url)

	var resp *http.Response
	keepGoing := true
	for keepGoing {
		var err error
		resp, err = http.Get(url)
		if err != nil {
			return nil, resp, err
		}

		switch resp.StatusCode {
		case 429:
			time.Sleep(1 * time.Minute)
		case 500:
			time.Sleep(5 * time.Second)
		default:
			keepGoing = false

		}
	}

	result := map[string]any{}
	err := json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, resp, err
	}

	return result, resp, nil
}
