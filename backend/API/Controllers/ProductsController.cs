using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using Infrastructure.Services;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace API.Controllers;

public class ProductsController(IGenericRepository<Product> repo, CloudinaryService cloudinaryService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery] ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);


        return await CreatePagedResult(repo, spec, specParams.PageIndex, specParams.PageSize);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null) return NotFound();

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Brand = dto.Brand,
            Type = dto.Type,
            QuantityInStock = dto.QuantityInStock,
            PictureUrl = ""
        };

        // Upload slike na Cloudinary
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            var uploadResult = await cloudinaryService.UploadImageAsync(dto.ImageFile);

            if (uploadResult != null)
            {
                product.PictureUrl = uploadResult; // tvoj CloudinaryService vraća string (URL)
            }
        }

        repo.Add(product);

        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        return BadRequest("Problem creating product");
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null) return NotFound();

        repo.Remove(product);

        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }

        return BadRequest("Problem deleting the product");
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();

        return Ok(await repo.ListAsync(spec));
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();

        return Ok(await repo.ListAsync(spec));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null) return NotFound();

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Brand = dto.Brand;
        product.Type = dto.Type;
        product.QuantityInStock = dto.QuantityInStock;

        if (await repo.SaveAllAsync()) return NoContent();

        return BadRequest("Problem updating product");
    }

    [HttpPut("{id:int}/image")]
    public async Task<ActionResult> UpdateProductImage(int id, [FromForm] UpdateProductImageDto dto)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null) return NotFound();

        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            var uploadResult = await cloudinaryService.UploadImageAsync(dto.ImageFile);
            if (!string.IsNullOrEmpty(uploadResult))
            {
                product.PictureUrl = uploadResult;
            }
        }

        if (await repo.SaveAllAsync()) return NoContent();

        return BadRequest("Problem updating product image");
    }



    private bool ProductExists(int id)
    {
        return repo.Exists(id);
    }
}
