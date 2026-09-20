using Api;
using Api.Extensions;
using Application;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddInfrastructureServices(builder.Configuration)
    .AddApplicationServices();

var app = builder.Build();

var applyMigrations = builder
            .Configuration
            .GetValue<bool>("Database:ApplyMigrations");

if (applyMigrations)
{
    await app.InitializeDatabaseAsync();
}

app.UseApiServices();

app.Run();