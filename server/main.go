package main

import (
	"fmt"
	"kitting-check/config"
	"kitting-check/handler"
	"kitting-check/middleware"
	"kitting-check/model"
	"kitting-check/repository"
	"kitting-check/service"
	"log"

	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(mysql.Open(cfg.MySQL.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect MySQL: %v", err)
	}
	fmt.Println("MySQL connected")

	if err := db.AutoMigrate(&model.SalesOrder{}, &model.OrderItem{}, &model.InboundRecord{}); err != nil {
		log.Fatalf("failed to auto migrate: %v", err)
	}
	fmt.Println("Database migrated")

	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.Redis.Addr,
	})
	fmt.Println("Redis connected")

	orderRepo := repository.NewOrderRepo(db)
	inboundRepo := repository.NewInboundRepo(db)

	kittingSvc := service.NewKittingService(orderRepo, rdb)
	orderSvc := service.NewOrderService(orderRepo)
	inboundSvc := service.NewInboundService(inboundRepo, orderRepo, kittingSvc, rdb)

	orderHandler := handler.NewOrderHandler(orderSvc)
	inboundHandler := handler.NewInboundHandler(inboundSvc)
	kanbanHandler := handler.NewKanbanHandler(kittingSvc, orderSvc)
	releaseHandler := handler.NewReleaseHandler(orderRepo)

	e := echo.New()
	e.Debug = true

	e.Use(middleware.CORS())

	api := e.Group("/api")
	api.POST("/orders", orderHandler.Create)
	api.GET("/orders", orderHandler.List)
	api.GET("/orders/:id", orderHandler.GetByID)
	api.PUT("/orders/:id/status", orderHandler.UpdateStatus)

	api.POST("/inbound", inboundHandler.Create)
	api.GET("/inbound/records", inboundHandler.List)

	api.GET("/kanban", kanbanHandler.GetKanban)
	api.GET("/kanban/shortages", kanbanHandler.GetShortages)

	api.GET("/release", releaseHandler.GetReleasable)
	api.POST("/release/batch", releaseHandler.BatchRelease)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Fatal(e.Start(addr))
}
