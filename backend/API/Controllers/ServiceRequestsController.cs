using API.DTOs;
using API.Extensions;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class ServiceRequestsController(StoreContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceRequestDto>>> GetMyRequests()
    {
        var email = User.GetEmail();
        var requests = await context.ServiceRequests
            .Where(r => r.CustomerEmail == email)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();

        return Ok(requests.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ServiceRequestDto>> CreateRequest(CreateServiceRequestDto dto)
    {
        var request = new ServiceRequest
        {
            CustomerEmail = User.GetEmail(),
            VehicleMake = dto.VehicleMake,
            VehicleModel = dto.VehicleModel,
            VehicleYear = dto.VehicleYear,
            ServiceType = dto.ServiceType,
            Description = dto.Description
        };

        context.ServiceRequests.Add(request);
        await context.SaveChangesAsync();

        return Ok(MapToDto(request));
    }

    private static ServiceRequestDto MapToDto(ServiceRequest r) => new ServiceRequestDto
    {
        Id = r.Id,
        CustomerEmail = r.CustomerEmail,
        VehicleMake = r.VehicleMake,
        VehicleModel = r.VehicleModel,
        VehicleYear = r.VehicleYear,
        ServiceType = r.ServiceType,
        Description = r.Description,
        Status = r.Status.ToString(),
        RequestedAt = r.RequestedAt,
        ScheduledAt = r.ScheduledAt
    };
}
