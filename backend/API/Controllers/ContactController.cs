using API.DTOs;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ContactController(StoreContext context) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult> SendMessage(ContactMessageDto dto)
    {
        var message = new ContactMessage
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Subject = dto.Subject ?? "Kontakt poruka",
            Message = dto.Message
        };

        context.ContactMessages.Add(message);
        await context.SaveChangesAsync();

        return Ok(new { message = "Poruka je uspješno poslana." });
    }
}
