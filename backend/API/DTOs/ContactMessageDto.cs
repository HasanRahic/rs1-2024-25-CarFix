using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ContactMessageDto
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    [Required] public string Message { get; set; } = string.Empty;
}
