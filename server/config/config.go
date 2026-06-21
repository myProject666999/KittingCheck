package config

import "fmt"

type Config struct {
	MySQL MySQLConfig
	Redis RedisConfig
	Server ServerConfig
}

type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Addr string
}

type ServerConfig struct {
	Port int
}

func (m MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		m.User, m.Password, m.Host, m.Port, m.DBName)
}

func Load() *Config {
	return &Config{
		MySQL: MySQLConfig{
			Host:     "localhost",
			Port:     3306,
			User:     "root",
			Password: "123456",
			DBName:   "kitting_check",
		},
		Redis: RedisConfig{
			Addr: "localhost:6379",
		},
		Server: ServerConfig{
			Port: 8080,
		},
	}
}
