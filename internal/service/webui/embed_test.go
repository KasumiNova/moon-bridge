package webui_test

import (
	"io/fs"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"moonbridge/internal/service/webui"
)

func TestHandlerServesConsoleIndex(t *testing.T) {
	handler := webui.NewHandler(testFS())

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/console/", nil)
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if body := recorder.Body.String(); !strings.Contains(body, `<div id="root"></div>`) {
		t.Fatalf("body does not contain index marker: %s", body)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "text/html") {
		t.Fatalf("Content-Type = %q, want text/html", contentType)
	}
}

func TestHandlerFallsBackToIndexForClientRoute(t *testing.T) {
	handler := webui.NewHandler(testFS())

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/console/providers/openai", nil)
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if body := recorder.Body.String(); !strings.Contains(body, "<title>Moon Bridge Console</title>") {
		t.Fatalf("body does not contain index title: %s", body)
	}
}

func TestHandlerServesStaticAsset(t *testing.T) {
	handler := webui.NewHandler(testFS())

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/console/assets/app.js", nil)
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if body := recorder.Body.String(); body != `console.log("console asset");` {
		t.Fatalf("body = %q", body)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "javascript") {
		t.Fatalf("Content-Type = %q, want javascript", contentType)
	}
}

func TestEmbeddedReturnsHandler(t *testing.T) {
	handler := webui.Embedded()

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/console/", nil)
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
}

func testFS() fs.FS {
	return fstest.MapFS{
		"index.html": &fstest.MapFile{
			Data: []byte(`<!doctype html><html><head><title>Moon Bridge Console</title></head><body><div id="root"></div><script type="module" src="/console/assets/app.js"></script></body></html>`),
		},
		"assets/app.js": &fstest.MapFile{
			Data: []byte(`console.log("console asset");`),
		},
	}
}
