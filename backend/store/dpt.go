package store

import "sync"

type DPTEntry struct {
	Name string `json:"name"`
	NIK  string `json:"nik"`
}

var (
	DPTStore = []DPTEntry{}
	DPTMutex sync.Mutex
)
